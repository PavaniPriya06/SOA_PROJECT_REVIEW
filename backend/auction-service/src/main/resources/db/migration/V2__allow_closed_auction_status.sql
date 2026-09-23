DO $$
BEGIN
    IF to_regclass('public.auctions') IS NOT NULL THEN
        ALTER TABLE public.auctions
            DROP CONSTRAINT IF EXISTS auctions_status_check;

        ALTER TABLE public.auctions
            ADD CONSTRAINT auctions_status_check
            CHECK (status IN ('UPCOMING', 'ACTIVE', 'CLOSED', 'ENDED'));
    END IF;
END
$$;