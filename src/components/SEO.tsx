import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://navlan.io";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

interface SEOProps {
  title: string;
  description: string;
  /** Absolute URL to a page-specific OG image; falls back to the site-wide default */
  image?: string;
  /** JSON-LD structured data objects to inject */
  structuredData?: Record<string, unknown>[];
}

const SEO = ({ title, description, image, structuredData }: SEOProps) => {
  const { pathname } = useLocation();
  const canonicalUrl = `${BASE_URL}${pathname}`;

  const ogImage = image || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content="@navlan" />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      {structuredData?.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
