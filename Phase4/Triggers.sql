-- Trigger to prevent negative stock amounts
BEGIN
    IF NEW.amount < 0 THEN
        RAISE EXCEPTION 'Stock amount cannot be negative';
    END IF;
    RETURN NEW;
END;


-- Trigger to calculate popularity score based on medication price
BEGIN
    -- Rule: Calculate popularity score based on price
    IF NEW.price > 500 THEN
        NEW.popularity_score := 1.0;
    ELSIF NEW.price > 200 THEN
        NEW.popularity_score := 2.5;
    ELSE
        NEW.popularity_score := 5.0;
    END IF;

    RETURN NEW;
END;
