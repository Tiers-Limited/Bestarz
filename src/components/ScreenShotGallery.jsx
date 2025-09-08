import { Typography } from "antd";

const { Title, Paragraph } = Typography;

const images = [
  "https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3184454/pexels-photo-3184454.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/462118/pexels-photo-462118.jpeg?auto=compress&cs=tinysrgb&w=800"
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
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* First row: 3 images */}
        {images.slice(0, 3).map((src, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl relative group h-64 sm:h-52 lg:h-64"
          >
            <img
              src={src}
              alt={`Screenshot ${i + 1}`}
              className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
              <div className="p-3 text-white text-sm">Screenshot {i + 1}</div>
            </div>
          </div>
        ))}

        {/* Second row: 2 images */}
        <div className="overflow-hidden rounded-xl relative group h-64 sm:h-52 lg:h-64 lg:col-span-2">
          <img
            src={images[3]}
            alt="Screenshot 4"
            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
            <div className="p-3 text-white text-sm">Screenshot 4</div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl relative group h-64 sm:h-52 lg:h-64">
          <img
            src={images[4]}
            alt="Screenshot 5"
            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
            <div className="p-3 text-white text-sm">Screenshot 5</div>
          </div>
        </div>
      </div>
    </section>
  );
}
