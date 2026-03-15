import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://navlan.io";

interface SEOProps {
  title: string;
  description: string;
  /** JSON-LD structured data objects to inject */
  structuredData?: Record<string, unknown>[];
}

const SEO = ({ title, description, structuredData }: SEOProps) => {
  const { pathname } = useLocation();
  const canonicalUrl = `${BASE_URL}${pathname}`;

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

      {/* Twitter */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content="@navlan" />

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
