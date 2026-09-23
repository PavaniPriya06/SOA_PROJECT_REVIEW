package com.bidvelocity.bidding.controller;

import com.bidvelocity.bidding.entity.Bid;
import com.bidvelocity.bidding.service.BidService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bids")
public class BidController {

    private final BidService bidService;

    public BidController(BidService bidService) {
        this.bidService = bidService;
    }

    @PostMapping
    public ResponseEntity<Bid> createBid(@Valid @RequestBody Bid bid) {
        Bid createdBid = bidService.createBid(bid);
        return new ResponseEntity<>(createdBid, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Bid>> getAllBids() {
        return new ResponseEntity<>(bidService.getAllBids(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bid> getBidById(@PathVariable Long id) {
        return new ResponseEntity<>(bidService.getBidById(id), HttpStatus.OK);
    }

    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<Bid>> getBidsByAuctionId(@PathVariable Long auctionId) {
        return new ResponseEntity<>(bidService.getBidsByAuctionId(auctionId), HttpStatus.OK);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(ResponseStatusException exception) {
        return ResponseEntity.status(exception.getStatusCode())
                .body(Map.of("message", exception.getReason()));
    }
}
