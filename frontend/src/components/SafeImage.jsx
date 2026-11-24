import { useEffect, useState } from "react";
import CategoryArt from "./CategoryArt";

/**
 * Shows a report photo. If there is no photo link, or the link is broken,
 * it shows the matching category illustration instead, so a report always
 * has an image.
 */
export default function SafeImage({
  src,
  alt = "",
  category,
  className = "",
  ...rest
}) {
  const [failed, setFailed] = useState(false);

  // A new link deserves a new chance to load
  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return <CategoryArt category={category} />;
  }

  return (
    <img
      {...rest}
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
