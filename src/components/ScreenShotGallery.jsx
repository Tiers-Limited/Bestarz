import { Image, Typography } from "antd";

const { Title, Paragraph } = Typography;

const images = [
  { src: "./images/page1.png", name: "Booking Page" },
  { src: "./images/page2.png", name: "Provider Dashboard" },
  { src: "./images/page3.png", name: "Provider Profile" },
  { src: "./images/page4.png", name: "Provider Customers" },
  { src: "./images/page5.png", name: "Provider Details" },
];

export default function ScreenShotGallery() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <Title level={2} className="text-white !mb-4">
          Explore Bestarz in Action
        </Title>
        <Paragraph className="text-gray-400 text-lg">
          Beautifully designed experiences that professionals and clients love.
        </Paragraph>
      </div>

      {/* Gallery Grid */}
      <Image.PreviewGroup>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* First row: 3 images */}
          {images.slice(0, 3).map((img, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl relative group h-64 sm:h-52 lg:h-64"
            >
              <Image
                src={img.src}
                alt={img.name}
                preview={{ mask: <div className="text-white">{img.name}</div> }}
                className="h-100 w-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}

          {/* Second row: 2 images */}
          <div className="overflow-hidden rounded-xl relative group h-64 sm:h-52 lg:h-64 lg:col-span-2">
            <Image
              src={images[3].src}
              alt={images[3].name}
              preview={{
                mask: <div className="text-white">{images[3].name}</div>,
              }}
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="overflow-hidden rounded-xl relative group h-64 sm:h-52 lg:h-64">
            <Image
              src={images[4].src}
              alt={images[4].name}
              preview={{
                mask: <div className="text-white">{images[4].name}</div>,
              }}
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </Image.PreviewGroup>
    </section>
  );
}
