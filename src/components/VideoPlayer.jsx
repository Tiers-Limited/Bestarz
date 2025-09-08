import { useState } from "react";
import { Play } from "lucide-react";
import { Card, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <Title level={2} className="text-white !mb-4">
          Watch How Bestarz Works
        </Title>
        <Paragraph className="text-gray-400 text-lg">
          A quick walkthrough to see how Bestarz helps professionals succeed.
        </Paragraph>
      </div>

      <Card className="glass-card p-0 mb-6 overflow-hidden rounded-2xl shadow-xl border border-gray-800 max-w-7xl mx-auto">
        <div className="relative group">
          {!isPlaying ? (
            <>
              {/* Thumbnail */}
              <div
                className="cursor-pointer"
                onClick={() => setIsPlaying(true)}
                style={{
                  backgroundImage:
                    "url(https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  height: "460px",
                }}
              >
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-20 h-20 bg-blue-600/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Play size={32} className="text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="text-white font-semibold text-base">
                    How Bestarz Works
                  </div>
                  <div className="text-gray-300 text-sm">2:30 mins</div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Video Player */}
              <video
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                controls
                autoPlay
                onEnded={() => setIsPlaying(false)}   // 👈 Reset to thumbnail
                className="w-full h-[460px] object-cover"
              />
            </>
          )}
        </div>
      </Card>
    </section>
  );
}
