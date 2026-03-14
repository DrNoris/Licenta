package org.example.licenta.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;

import java.time.Duration;

@Configuration
public class RedisConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        ObjectMapper redisObjectMapper = new ObjectMapper();
        redisObjectMapper.registerModule(new JavaTimeModule());
        redisObjectMapper.activateDefaultTyping(
                redisObjectMapper.getPolymorphicTypeValidator(),
                ObjectMapper.DefaultTyping.NON_FINAL
        );

        RedisSerializer<Object> serializer = new RedisSerializer<>() {
            @Override
            public byte[] serialize(Object value) {
                if (value == null) return new byte[0];
                try {
                    return redisObjectMapper.writeValueAsBytes(value);
                } catch (Exception e) {
                    throw new RuntimeException("Redis serialization error", e);
                }
            }

            @Override
            public Object deserialize(byte[] bytes) {
                if (bytes == null || bytes.length == 0) return null;
                try {
                    return redisObjectMapper.readValue(bytes, Object.class);
                } catch (Exception e) {
                    throw new RuntimeException("Redis deserialization error", e);
                }
            }
        };

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(serializer)
                );

        RedisCacheConfiguration timeSlotsConfig = defaultConfig
                .entryTtl(Duration.ofDays(365));

        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaultConfig)
                .withCacheConfiguration("timeSlots", timeSlotsConfig)
                .build();
    }
}