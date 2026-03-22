import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getTierConfig } from "./AffordabilityBadge";

interface MapCity {
  name: string;
  slug: string;
  lat: number;
  lng: number;
  tier: string | null;
  price: string | null;
}

interface IsraelCityMapProps {
  cities: MapCity[];
  featuredSlugs?: string[];
  hoveredSlug?: string | null;
  onHoverCity?: (slug: string | null) => void;
}

// Natural Earth GeoJSON-derived outline: Israel + Palestine + Golan merged (public domain)
const ISRAEL_OUTLINE =
  "M12.5,268.1L10.0,264.0L12.3,262.7L13.8,261.1L18.5,257.5L20.6,254.2L25.5,251.1L27.6,247.9L35.4,241.0L39.2,236.4L39.4,235.9L40.3,234.1L42.8,231.3L52.1,217.6L52.8,216.8L58.7,205.4L61.6,199.9L63.6,197.3L66.8,188.1L66.9,187.6L66.8,186.4L66.8,185.9L68.3,185.3L76.7,162.9L80.4,147.2L83.7,133.6L84.3,132.6L84.9,127.9L85.4,126.5L85.2,124.9L87.6,116.4L88.2,107.0L89.1,104.9L90.6,104.2L91.9,104.5L94.1,105.6L95.7,105.9L96.6,105.7L100.3,102.4L100.7,101.5L101.6,98.8L102.0,97.4L101.9,96.2L100.6,95.6L101.2,94.1L101.9,87.7L103.3,84.3L103.8,82.3L103.3,80.5L103.8,80.1L104.4,79.5L104.8,79.1L104.1,78.4L104.6,78.3L104.7,78.3L113.1,78.8L113.6,78.6L114.7,77.9L115.4,77.7L116.0,77.7L117.5,78.0L118.2,78.1L122.1,77.0L123.4,77.0L123.9,77.2L124.5,77.4L125.7,78.2L126.7,79.3L127.5,80.5L128.4,81.6L129.8,81.8L135.7,80.5L140.7,78.7L144.0,78.4L144.5,76.8L146.4,73.9L147.3,72.1L147.9,69.5L148.1,64.3L148.9,62.0L149.9,60.6L150.5,59.2L151.2,58.2L152.4,58.0L153.0,58.7L154.9,61.2L156.3,62.0L156.3,62.0L156.3,62.0L156.9,62.4L156.9,62.4L157.0,62.0L157.0,62.0L158.4,60.8L158.6,59.4L159.8,58.8L162.0,58.6L162.8,57.3L166.8,53.8L168.7,53.4L170.1,53.3L171.5,52.9L173.0,52.4L174.2,51.7L175.9,50.1L178.0,46.6L179.6,45.0L179.8,45.6L179.2,46.2L179.1,47.9L178.7,48.5L178.5,49.9L176.8,51.0L175.9,51.7L175.2,52.0L190.0,52.0L190.0,98.0L186.1,117.3L176.2,115.4L175.2,114.3L175.3,114.3L174.8,114.0L174.3,113.9L173.7,114.1L173.0,114.3L173.0,114.3L171.2,114.7L165.4,117.8L162.0,120.4L160.7,121.0L160.3,121.2L157.8,120.9L157.7,120.9L157.8,120.9L155.9,122.1L154.3,123.9L153.4,124.5L152.6,124.8L152.4,125.2L152.3,126.0L152.7,126.8L153.6,127.2L153.6,127.9L152.9,127.9L152.9,128.7L153.5,129.6L153.8,132.3L154.4,133.6L154.0,134.2L153.8,134.2L153.8,134.0L153.6,133.6L153.4,134.0L152.9,135.1L152.3,134.4L152.6,136.6L152.9,137.2L151.5,137.2L151.5,137.9L152.0,137.9L152.5,137.9L153.2,138.8L153.4,139.3L154.4,140.1L154.4,140.8L153.5,141.0L152.8,141.6L152.5,142.3L152.3,143.0L152.6,143.2L152.9,143.4L153.2,143.6L153.6,143.7L153.6,144.4L153.0,144.8L152.3,145.1L152.9,145.8L151.5,146.6L151.7,146.8L151.9,146.7L152.1,146.8L152.3,147.3L151.5,147.3L151.5,147.9L152.1,148.5L152.2,148.9L151.8,149.2L150.8,149.4L151.2,150.5L151.5,150.9L152.0,151.3L152.4,152.0L152.7,152.8L152.9,153.7L152.3,153.7L152.3,153.0L151.5,153.0L151.5,153.7L152.0,154.8L152.0,157.9L152.9,159.4L152.4,160.7L152.4,162.7L152.8,164.7L153.6,165.9L153.1,166.1L152.7,166.4L152.4,166.8L152.3,167.4L153.6,167.4L152.3,172.3L151.8,174.0L152.3,175.2L152.3,176.0L151.4,176.4L150.9,176.9L150.9,177.4L151.5,178.1L149.7,180.6L149.7,181.9L150.8,183.2L149.0,184.4L148.4,186.2L148.6,191.0L149.8,193.5L150.0,194.6L150.1,196.0L150.2,196.9L150.8,198.0L150.8,198.9L150.3,199.4L149.6,199.5L148.9,199.8L148.6,200.7L151.2,209.1L150.1,210.4L150.1,211.2L152.3,216.8L148.9,220.0L146.3,225.2L144.0,229.8L142.3,237.4L141.7,245.2L141.8,245.3L141.8,245.4L141.7,245.5L141.7,245.4L141.7,245.5L141.6,251.5L141.5,252.6L141.1,255.0L139.2,259.2L137.3,262.2L138.1,262.9L137.9,265.2L136.4,267.4L135.1,269.9L135.7,272.8L136.7,275.5L137.8,277.6L139.4,280.2L140.1,283.1L139.6,286.1L134.7,294.4L134.0,297.5L134.0,300.8L132.9,302.7L130.0,305.0L128.8,306.1L127.4,308.4L127.2,310.8L127.2,313.1L126.8,315.5L126.2,316.5L124.5,317.8L123.7,318.6L123.0,319.9L122.6,321.1L122.1,323.7L121.3,326.2L121.3,326.2L115.2,337.0L110.7,349.8L110.2,352.3L108.4,356.6L108.4,359.1L108.9,360.1L110.4,362.3L110.7,363.8L110.4,365.2L109.9,366.3L109.2,367.4L108.5,368.7L107.6,374.2L106.8,376.0L106.8,379.0L108.9,385.4L108.9,388.7L107.2,392.2L102.7,398.0L101.5,402.1L101.5,403.4L101.1,404.3L100.5,405.1L100.1,406.0L99.4,409.6L99.3,416.0L98.8,418.1L94.0,429.5L93.2,432.1L92.6,438.0L91.6,440.6L90.3,442.6L89.5,444.9L89.1,447.7L88.6,449.1L87.9,450.1L86.1,452.0L85.3,453.1L84.9,453.9L84.7,454.6L84.4,455.0L83.6,455.0L82.6,454.9L81.9,455.0L80.9,453.5L78.6,449.1L77.8,446.6L78.0,439.4L75.3,428.6L71.2,418.8L66.6,407.8L66.0,402.2L66.0,401.5L66.0,400.9L65.8,400.3L65.5,399.7L61.4,389.6L55.3,374.2L51.8,365.5L50.6,364.0L44.9,359.7L44.2,358.7L44.0,357.5L44.1,355.7L45.1,352.5L45.2,351.1L44.1,349.8L42.5,347.9L41.8,346.1L41.6,341.7L39.3,333.4L32.9,318.8L27.5,306.6L23.5,297.5L20.2,288.7L16.1,277.6L15.0,274.8L13.2,269.8L12.5,268.1Z";

// Coordinate transform: lat/lng → SVG x/y (matching merged outline)
const SCALE = 104.6675;
const OFFSET_X = 10.0;
const OFFSET_Y = 45.007;
const LNG_MIN = 34.2003;
const LAT_MAX = 33.4067;

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  return {
    x: OFFSET_X + (lng - LNG_MIN) * SCALE,
    y: OFFSET_Y + (LAT_MAX - lat) * SCALE,
  };
}

export default function IsraelCityMap({
  cities,
  featuredSlugs = [],
  hoveredSlug,
  onHoverCity,
}: IsraelCityMapProps) {
  const [localHovered, setLocalHovered] = useState<string | null>(null);
  const navigate = useNavigate();

  const activeHover = hoveredSlug ?? localHovered;

  const plotted = useMemo(() => {
    return cities.map((city) => {
      const { x, y } = latLngToSvg(city.lat, city.lng);
      const isFeatured = featuredSlugs.includes(city.slug);
      const config = getTierConfig(city.tier);
      return { ...city, x, y, isFeatured, color: config?.hex ?? "#9CA3A8" };
    });
  }, [cities, featuredSlugs]);

  const handleHover = (slug: string | null) => {
    setLocalHovered(slug);
    onHoverCity?.(slug);
  };

  return (
    <svg
      viewBox="0 0 200 500"
      className="w-full h-full"
      style={{ maxHeight: "520px" }}
      role="img"
      aria-label="Map of Israel showing city locations"
    >
      {/* Country outline */}
      <path
        d={ISRAEL_OUTLINE}
        fill="#F2EDE4"
        stroke="#2D3234"
        strokeWidth="1"
        strokeOpacity="0.3"
      />

      {/* City dots — non-featured first, then featured on top */}
      {plotted
        .sort((a, b) => (a.isFeatured ? 1 : 0) - (b.isFeatured ? 1 : 0))
        .map((city) => {
          const isHovered = activeHover === city.slug;
          const r = city.isFeatured ? 5 : 3.2;
          const hoverR = r + 2;

          return (
            <g
              key={city.slug}
              className="cursor-pointer"
              onMouseEnter={() => handleHover(city.slug)}
              onMouseLeave={() => handleHover(null)}
              onClick={() => navigate(`/city/${city.slug}`)}
            >
              {/* Hover ring */}
              {isHovered && (
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={hoverR}
                  fill="none"
                  stroke={city.color}
                  strokeWidth="1.5"
                  opacity="0.35"
                />
              )}

              {/* Dot */}
              <circle
                cx={city.x}
                cy={city.y}
                r={isHovered ? r + 1 : r}
                fill={city.color}
                stroke="white"
                strokeWidth={city.isFeatured ? 1.5 : 1}
                style={{ transition: "r 0.15s ease" }}
              />

              {/* Tooltip on hover */}
              {isHovered && (
                <g>
                  {/* Tooltip background */}
                  <rect
                    x={city.x + 10}
                    y={city.y - 28}
                    width={Math.max(city.name.length * 6.5 + 16, city.price ? 90 : 70)}
                    height={city.price ? 38 : 24}
                    rx="4"
                    fill="#2D3234"
                    fillOpacity="0.92"
                  />
                  {/* City name */}
                  <text
                    x={city.x + 18}
                    y={city.y - 14}
                    fill="white"
                    fontSize="10"
                    fontFamily="DM Sans, sans-serif"
                    fontWeight="600"
                  >
                    {city.name}
                  </text>
                  {/* Tier + Price */}
                  {(city.tier || city.price) && (
                    <text
                      x={city.x + 18}
                      y={city.y - 1}
                      fill="rgba(255,255,255,0.7)"
                      fontSize="8.5"
                      fontFamily="DM Sans, sans-serif"
                    >
                      {getTierConfig(city.tier)?.label ?? ""}
                      {city.price ? ` · ${city.price}` : ""}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
    </svg>
  );
}
