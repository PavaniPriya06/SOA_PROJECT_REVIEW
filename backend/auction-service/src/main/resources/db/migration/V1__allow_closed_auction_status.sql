DO $$
BEGIN
    IF to_regclass('public.auctions') IS NOT NULL THEN
        ALTER TABLE auctions DROP CONSTRAINT IF EXISTS auctions_status_check;
        ALTER TABLE auctions
            ADD CONSTRAINT auctions_status_check
            CHECK (status IN ('UPCOMING', 'ACTIVE', 'ENDED', 'CLOSED'));
    END IF;
END
$$;