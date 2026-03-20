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

// Natural Earth GeoJSON-derived Israel outline (public domain)
const ISRAEL_OUTLINE =
  "M10.0,276.0L11.8,274.6L17.4,271.0L21.3,267.4L21.6,265.6L20.7,261.8L20.7,259.9L23.1,256.1L35.5,245.9L37.1,244.9L37.2,244.9L40.7,242.1L43.8,239.9L39.8,237.9L35.6,235.2L36.5,233.3L39.2,230.4L48.9,216.0L49.7,215.2L55.8,203.3L58.8,197.5L60.9,194.7L64.3,185.1L64.4,184.5L64.3,183.3L64.3,182.8L65.8,182.1L74.7,158.6L78.6,142.2L82.0,127.9L82.6,126.8L83.3,121.9L83.8,120.5L83.6,118.8L86.2,109.9L86.8,100.1L87.6,97.8L89.3,97.1L90.7,97.4L92.9,98.6L94.6,98.9L95.6,98.7L99.4,95.2L99.9,94.3L100.8,91.4L101.3,90.0L101.1,88.7L99.7,88.1L100.4,86.5L101.1,79.8L102.6,76.2L103.1,74.1L102.6,72.2L103.1,71.8L103.7,71.1L104.2,70.8L103.4,70.0L104.0,69.9L104.1,69.9L112.9,70.4L113.3,70.3L114.5,69.5L115.3,69.2L115.9,69.3L117.5,69.6L118.3,69.7L122.3,68.5L123.7,68.5L124.2,68.8L124.9,69.0L126.1,69.8L127.2,71.0L127.9,72.3L128.9,73.4L130.4,73.6L136.6,72.2L141.8,70.3L145.2,70.1L145.8,68.4L147.8,65.3L148.7,63.5L149.3,60.7L149.6,55.3L150.4,52.8L151.4,51.3L152.1,49.8L152.8,48.8L154.1,48.7L154.7,49.3L156.7,52.0L158.1,52.8L158.1,52.8L158.2,52.8L158.8,53.3L158.8,53.3L158.9,52.8L158.9,52.8L160.4,51.5L160.6,50.1L161.8,49.5L164.1,49.3L165.0,47.9L169.2,44.2L171.1,43.8L172.6,43.7L174.2,43.3L175.7,42.7L177.0,42.0L178.8,40.4L181.0,36.7L182.6,35.0L182.8,35.6L182.2,36.3L182.0,38.1L181.7,38.7L181.4,40.1L179.6,41.2L178.8,42.0L176.4,42.9L180.6,45.3L176.9,49.7L177.7,50.6L180.7,52.4L181.2,57.5L183.6,58.8L184.0,62.0L182.8,64.1L181.6,65.7L181.6,67.4L185.7,68.8L185.4,70.3L186.8,80.7L187.4,82.1L190.0,85.7L188.5,88.2L187.7,88.3L185.8,91.1L184.5,94.4L184.9,95.7L184.1,98.5L178.6,104.0L175.7,107.7L175.7,107.7L173.8,108.1L167.7,111.4L164.1,114.1L162.8,114.7L162.3,114.9L159.7,114.6L159.7,114.6L159.7,114.6L157.7,115.8L156.0,117.7L155.1,118.4L154.3,118.7L154.0,119.1L154.0,120.0L154.4,120.8L155.4,121.2L155.4,121.9L154.6,121.9L154.6,122.7L155.2,123.7L155.6,126.6L156.2,127.9L155.7,128.5L155.6,128.6L155.5,128.3L155.4,127.9L155.1,128.3L154.6,129.5L153.9,128.7L154.3,131.0L154.6,131.7L153.1,131.7L153.1,132.5L153.7,132.4L154.1,132.4L154.9,133.4L155.1,133.9L156.2,134.8L156.2,135.5L155.2,135.7L154.5,136.3L154.1,137.1L153.9,137.8L154.3,138.0L154.6,138.2L154.9,138.4L155.4,138.5L155.4,139.3L154.7,139.7L153.9,140.0L154.6,140.7L153.1,141.5L153.3,141.7L153.6,141.7L153.8,141.8L153.9,142.3L153.1,142.3L153.1,143.0L153.8,143.5L153.9,144.0L153.4,144.3L152.4,144.5L152.8,145.7L153.1,146.0L153.6,146.5L154.1,147.2L145.2,145.3L142.6,144.7L140.0,144.6L137.2,143.9L136.6,141.1L136.6,137.7L135.6,135.1L132.4,133.4L129.1,133.1L122.2,133.4L120.2,132.8L117.1,130.6L115.6,129.9L115.4,129.9L113.5,130.0L111.9,131.0L109.2,133.7L105.8,135.5L102.5,136.8L99.6,138.6L97.4,141.8L96.1,147.5L95.7,149.3L94.9,151.6L94.5,151.9L93.0,152.3L92.6,152.6L92.1,154.0L91.7,157.4L91.4,158.9L92.8,159.2L93.5,160.0L93.7,161.2L93.3,162.6L92.5,164.0L88.3,167.3L87.9,169.0L88.4,170.4L90.0,173.0L91.1,175.8L90.8,179.6L93.3,187.1L92.2,188.2L92.4,190.1L92.3,191.8L91.1,193.0L92.6,195.0L93.4,195.5L92.9,196.1L93.1,196.7L94.3,197.5L95.8,197.7L96.8,199.5L96.3,204.7L95.8,205.1L93.2,205.2L92.4,205.5L91.4,206.4L90.2,207.3L90.0,207.7L90.4,207.9L92.7,208.3L93.9,208.2L95.5,207.8L97.5,206.1L98.7,205.5L99.6,205.4L100.9,205.4L102.2,206.1L103.2,207.9L104.9,208.8L105.8,208.7L107.5,209.8L111.6,210.6L112.9,210.4L112.9,209.8L112.5,209.2L112.7,208.6L113.4,208.5L114.1,208.5L115.9,209.3L116.2,209.2L116.2,208.8L116.2,207.1L115.9,205.5L115.5,204.4L115.0,203.6L115.0,202.9L115.8,202.4L116.9,202.7L117.4,204.0L117.3,205.1L117.5,205.9L118.1,206.7L119.4,206.4L120.0,206.5L120.4,206.8L120.7,207.1L120.1,207.9L120.4,208.2L121.1,208.2L121.6,208.5L121.1,209.3L120.6,210.0L120.9,211.3L121.0,212.2L121.4,212.5L120.8,213.2L120.3,214.7L120.3,215.5L121.0,216.1L121.4,217.0L120.8,217.7L120.2,218.2L119.9,219.8L119.3,220.2L119.1,221.2L118.6,221.3L117.9,221.0L117.5,220.4L117.1,220.3L116.6,220.7L115.0,219.8L112.2,220.2L110.8,218.8L109.5,218.7L108.9,218.3L106.3,218.7L105.1,220.4L102.8,222.1L99.0,224.9L89.6,230.0L87.6,232.0L87.4,232.4L85.6,235.3L85.1,238.3L85.1,241.4L84.5,244.9L79.5,252.0L77.9,255.7L79.2,259.4L81.6,260.9L84.5,261.3L87.6,260.9L90.4,260.1L96.9,259.3L110.6,259.4L117.0,257.4L129.0,248.8L135.3,245.7L142.8,245.2L142.8,245.2L142.7,251.6L142.7,252.7L142.2,255.2L140.3,259.6L138.2,262.8L139.0,263.6L138.9,265.9L137.3,268.2L135.9,270.9L136.6,273.9L137.6,276.7L138.8,278.9L140.4,281.7L141.2,284.7L140.6,287.8L135.5,296.6L134.8,299.8L134.8,303.2L133.6,305.2L130.6,307.7L129.3,308.8L127.9,311.3L127.6,313.8L127.6,316.2L127.3,318.7L126.6,319.7L124.8,321.1L123.9,322.0L123.2,323.3L122.8,324.6L122.3,327.3L121.5,329.9L121.5,330.0L115.1,341.2L110.3,354.7L109.8,357.3L107.9,361.8L107.9,364.4L108.4,365.5L110.0,367.7L110.3,369.3L110.1,370.8L109.5,372.0L108.7,373.1L108.1,374.5L107.0,380.2L106.3,382.1L106.2,385.3L108.5,392.0L108.5,395.4L106.7,399.1L102.0,405.2L100.7,409.6L100.6,410.9L100.2,411.9L99.7,412.7L99.3,413.7L98.5,417.4L98.4,424.1L97.9,426.3L92.8,438.3L92.0,441.0L91.4,447.2L90.4,449.9L88.9,452.0L88.1,454.4L87.6,457.4L87.2,458.9L86.5,459.8L84.6,461.9L83.7,463.1L83.3,463.8L83.1,464.5L82.7,465.0L81.9,465.0L80.8,464.9L80.1,465.0L79.1,463.4L76.6,458.8L75.9,456.2L76.1,448.6L73.2,437.3L68.9,427.0L64.1,415.5L63.4,409.6L63.5,408.9L63.4,408.2L63.2,407.6L62.9,407.0L58.7,396.4L52.2,380.2L48.5,371.2L47.3,369.6L41.3,365.0L40.6,364.0L40.3,362.7L40.5,360.8L41.6,357.5L41.6,356.0L40.5,354.7L38.8,352.6L38.1,350.8L37.9,346.2L35.5,337.5L28.7,322.1L23.1,309.4L18.9,299.8L15.4,290.6L11.1,279.0L10.0,276.0Z";

// Coordinate transform: lat/lng → SVG x/y (matching Natural Earth outline)
const LAT_MIN = 29.4897;
const LAT_MAX = 33.4067;
const LNG_MIN = 34.2484;
const LNG_MAX = 35.8881;
const PADDING = 10;
const USABLE_W = 180; // 200 - 2*padding
const USABLE_H = 480; // 500 - 2*padding

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  return {
    x: PADDING + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * USABLE_W,
    y: PADDING + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * USABLE_H,
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
