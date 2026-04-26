package org.example.licenta.application.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.concurrent.TimeUnit;
import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final long URL_EXPIRY_SECONDS = 600;
    private static final long CACHE_EXPIRY_SECONDS = 270;

    public String uploadPrivate(MultipartFile file, String folder) throws IOException {
        Map result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "format", "jpg",
                "transformation", "q_auto,f_auto",
                "type", "authenticated",
                "resource_type", "image"
        ));
        return (String) result.get("public_id");
    }

    public void deleteImage(String publicId) throws IOException {
        redisTemplate.delete("signed_url:" + publicId);

        cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                "type",          "authenticated",
                "resource_type", "image",
                "invalidate",    true
        ));
    }

    public String generateSignedUrl(String publicId) {
        String cacheKey = "signed_url:" + publicId;

        String cached = (String) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) return cached;

        long expiresAt = System.currentTimeMillis() / 1000 + URL_EXPIRY_SECONDS;
        try {
            Map options = ObjectUtils.asMap(
                    "type",       "authenticated",
                    "expires_at", expiresAt,
                    "sign_url",   true
            );
            String signedUrl = cloudinary.privateDownload(publicId, "jpg", options);

            redisTemplate.opsForValue().set(
                    cacheKey,
                    signedUrl,
                    CACHE_EXPIRY_SECONDS,
                    TimeUnit.SECONDS
            );

            return signedUrl;
        } catch (Exception e) {
            throw new RuntimeException("Could not generate signed URL for: " + publicId, e);
        }
    }
}