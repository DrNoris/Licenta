package org.example.licenta.application.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadPrivate(MultipartFile file, String folder) throws IOException {
        Map result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "type", "authenticated",
                "resource_type", "image"
        ));
        return (String) result.get("public_id");
    }

    public void deleteImage(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, ObjectUtils.asMap(
                "type",          "authenticated",
                "resource_type", "image",
                "invalidate",    true
        ));
    }

    public String generateSignedUrl(String publicId) {
        long expiresAt = System.currentTimeMillis() / 1000 + 300;
        try {
            Map options = ObjectUtils.asMap(
                    "type",       "authenticated",
                    "expires_at", expiresAt,
                    "sign_url",   true
            );
            return cloudinary.privateDownload(publicId, "jpg", options);
        } catch (Exception e) {
            throw new RuntimeException("Could not generate signed URL for: " + publicId, e);
        }
    }
}
