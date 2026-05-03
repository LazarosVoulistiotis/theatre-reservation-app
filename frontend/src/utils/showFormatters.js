/*
  Centralised helper functions for theatre show data.

  The backend may return snake_case or camelCase fields depending on
  the database query aliases. Keeping the fallback logic here prevents
  duplicated code across screens and makes the frontend easier to maintain.
*/

export function getShowId(show, fallbackIndex = 0) {
    return String(show?.show_id || show?.showId || show?.id || fallbackIndex);
}

export function getShowTitle(show) {
    return show?.title || show?.show_title || show?.showTitle || "Untitled show";
}

export function getShowTheatre(show) {
    return (
        show?.theatre_name ||
        show?.theatreName ||
        show?.theatre ||
        show?.venue_name ||
        show?.venueName ||
        "Theatre not provided"
    );
}

export function getShowLocation(show) {
    return (
        show?.location ||
        show?.theatre_location ||
        show?.theatreLocation ||
        show?.city ||
        show?.theatre_city ||
        show?.theatreCity ||
        show?.venue_location ||
        show?.venueLocation ||
        "Location not provided"
    );
}

export function getShowDescription(show) {
    return show?.description || show?.show_description || "No description available.";
}

export function formatShowDuration(show) {
    const duration = show?.duration_minutes || show?.durationMinutes || show?.duration;

    if (!duration) {
        return "Duration N/A";
    }

    const durationText = String(duration);

    return durationText.toLowerCase().includes("min")
        ? durationText
        : `${durationText} min`;
}

export function formatShowAgeRating(show) {
    const ageRating = show?.age_rating || show?.ageRating || show?.minimum_age;

    if (!ageRating) {
        return "Age N/A";
    }

    const ratingText = String(ageRating);

    return ratingText.toLowerCase().startsWith("age")
        ? ratingText
        : `Age ${ratingText}`;
}