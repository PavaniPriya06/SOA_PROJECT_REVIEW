package com.bidvelocity.auction.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.net.MalformedURLException;
import java.util.UUID;

@Service
public class AuctionImageStorageService {

    private final Path uploadDirectory;

    public AuctionImageStorageService(
            @Value("${auction.images.directory:uploads}") String uploadDirectory) {
        this.uploadDirectory = Paths.get(uploadDirectory).toAbsolutePath().normalize();
    }

    public String store(MultipartFile image) {
        String extension = StringUtils.getFilenameExtension(image.getOriginalFilename());
        String filename = UUID.randomUUID() + (extension == null ? "" : "." + extension.toLowerCase());
        try {
            Files.createDirectories(uploadDirectory);
            image.transferTo(uploadDirectory.resolve(filename));
            return "/uploads/" + filename;
        } catch (IOException exception) {
            throw new IllegalStateException("Unable to store auction image.", exception);
        }
    }

    public Resource load(String filename) {
        try {
            Path imagePath = uploadDirectory.resolve(filename).normalize();
            if (!imagePath.startsWith(uploadDirectory)) {
                return null;
            }
            Resource resource = new UrlResource(imagePath.toUri());
            return resource.exists() && resource.isReadable() ? resource : null;
        } catch (MalformedURLException exception) {
            return null;
        }
    }
}