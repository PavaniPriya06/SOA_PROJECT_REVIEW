package com.bidvelocity.auction.controller;

import com.bidvelocity.auction.entity.Auction;
import com.bidvelocity.auction.service.AuctionService;
import com.bidvelocity.auction.service.AuctionImageStorageService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;

import java.util.List;

@RestController
@RequestMapping("/auctions")
public class AuctionController {

    private final AuctionService auctionService;
    private final AuctionImageStorageService imageStorageService;

    public AuctionController(AuctionService auctionService, AuctionImageStorageService imageStorageService) {
        this.auctionService = auctionService;
        this.imageStorageService = imageStorageService;
    }

    public AuctionController(AuctionService auctionService) {
        this(auctionService, null);
    }

    /**
     * Create a new auction
     * POST /auctions
     */
    @PostMapping
    public ResponseEntity<Auction> createAuction(@Valid @RequestBody Auction auction) {
        Auction createdAuction = auctionService.createAuction(auction, null);
        return new ResponseEntity<>(createdAuction, HttpStatus.CREATED);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Auction> createAuctionWithImage(
            @RequestPart("auction") @Valid Auction auction,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        Auction createdAuction = auctionService.createAuction(auction, image);
        return new ResponseEntity<>(createdAuction, HttpStatus.CREATED);
    }

    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        Resource image = imageStorageService.load(filename);
        if (image == null) {
            return ResponseEntity.notFound().build();
        }
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String contentType = Files.probeContentType(image.getFile().toPath());
            if (contentType != null) {
                mediaType = MediaType.parseMediaType(contentType);
            }
        } catch (Exception ignored) {
            // Use the binary fallback when the host cannot detect the file type.
        }
        return ResponseEntity.ok().contentType(mediaType).body(image);
    }

    /**
     * Get all auctions
     * GET /auctions
     */
    @GetMapping
    public ResponseEntity<List<Auction>> getAllAuctions() {
        List<Auction> auctions = auctionService.getAllAuctions();
        return new ResponseEntity<>(auctions, HttpStatus.OK);
    }

    /**
     * Get auction by ID
     * GET /auctions/{id}
     */
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Auction> getAuctionById(@PathVariable Long id) {
        Auction auction = auctionService.getAuctionById(id);
        return new ResponseEntity<>(auction, HttpStatus.OK);
    }

    /**
     * Get all active auctions
     * GET /auctions/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<Auction>> getActiveAuctions() {
        List<Auction> activeAuctions = auctionService.getActiveAuctions();
        return new ResponseEntity<>(activeAuctions, HttpStatus.OK);
    }

    /**
     * Start an auction (change status to ACTIVE)
     * PUT /auctions/{id}/start
     */
    @PutMapping("/{id}/start")
    public ResponseEntity<Auction> startAuction(@PathVariable Long id) {
        Auction startedAuction = auctionService.startAuction(id);
        return new ResponseEntity<>(startedAuction, HttpStatus.OK);
    }

    /**
    * Close an auction and select its highest bidder as the winner.
     * PUT /auctions/{id}/close
     */
    @PutMapping("/{id}/close")
    public ResponseEntity<Auction> closeAuction(@PathVariable Long id) {
        Auction closedAuction = auctionService.closeAuction(id);
        return new ResponseEntity<>(closedAuction, HttpStatus.OK);
    }
}
