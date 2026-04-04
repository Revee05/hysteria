export default function ContactMap({ contactData }) {
  const defaultMapUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126559.80427893577!2d110.32047802407377!3d-6.993126356472846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708b4ec52229d7%3A0xc791d6abc9236c7!2sSemarang%2C%20Kota%20Semarang%2C%20Jawa%20Tengah!5e0!3m2!1sid!2sid!4v1738157000000!5m2!1sid!2sid";

  const extractMapUrl = (data) => {
    if (!data) return defaultMapUrl;

    if (data.includes("<iframe")) {
      const srcMatch = data.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
    }

    return data;
  };

  const mapUrl = extractMapUrl(contactData?.mapsEmbedUrl);

  return (
    <section className="mt-14">
      <div className="overflow-hidden rounded-xl shadow-lg">
        <iframe
          title="Google Maps"
          className="h-60 w-full md:h-80"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
          allowFullScreen
        />
      </div>
    </section>
  );
}
