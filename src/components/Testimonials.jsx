import { Typography, Carousel, Card, Rate, Avatar, Row, Col } from "antd";
import { useEffect, useState } from "react";

const { Title, Paragraph } = Typography;

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Wedding Photographer",
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100",
    rating: 5,
    text: "Bestarz transformed my photography business. I've booked 200% more clients and the payment system is flawless!",
  },
  {
    name: "Mike Rodriguez",
    role: "DJ & Music Producer",
    avatar:
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100",
    rating: 5,
    text: "The auto-matching feature is incredible. I get high-quality bookings without spending time on lead generation.",
  },
  {
    name: "Emma Chen",
    role: "Event Coordinator",
    avatar:
      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100",
    rating: 5,
    text: "Finding the perfect vendors for my events is now effortless. The platform's quality control is outstanding.",
  },
  {
    name: "David Kim",
    role: "Catering Service Owner",
    avatar:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
    rating: 5,
    text: "Clients love my services more than ever thanks to Bestarz. Scheduling and payments are so easy now.",
  },
  {
    name: "Olivia Brown",
    role: "Florist",
    avatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
    rating: 5,
    text: "The platform helps me connect with high-quality clients consistently. I highly recommend it!",
  },
  {
    name: "James Lee",
    role: "Makeup Artist",
    avatar:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
    rating: 5,
    text: "Bestarz makes it easy to manage bookings and build a loyal client base.",
  },
  {
    name: "Sophia Martinez",
    role: "Videographer",
    avatar:
      "https://images.pexels.com/photos/1181356/pexels-photo-1181356.jpeg?auto=compress&cs=tinysrgb&w=100",
    rating: 5,
    text: "I love how simple it is to showcase my work and get hired faster.",
  },
  {
    name: "Liam Davis",
    role: "DJ & Sound Engineer",
    avatar:
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100",
    rating: 5,
    text: "Bestarz has completely transformed my music business with real clients and effortless payments.",
  },
  {
    name: "Mia Wilson",
    role: "Event Planner",
    avatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
    rating: 5,
    text: "The platform makes finding and managing vendors for events so much easier.",
  },
  {
    name: "Noah Thompson",
    role: "Photographer",
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100",
    rating: 5,
    text: "I’ve booked more clients than ever. The system is seamless and professional.",
  },
  {
    name: "Ava Robinson",
    role: "Catering Manager",
    avatar:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100",
    rating: 5,
    text: "Managing orders and clients has never been this easy. Bestarz is a lifesaver.",
  },
  {
    name: "Ethan Clark",
    role: "Florist",
    avatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100",
    rating: 5,
    text: "Connecting with the right clients has boosted my business dramatically!",
  },
];

// Helper: split array into chunks
const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export default function Testimonials() {
    const [slidesToShow, setSlidesToShow] = useState(3);

  // Handle responsive slides
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSlidesToShow(1); // mobile
      } else {
        setSlidesToShow(3); // tablet and desktop
      }
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Chunk testimonials based on slidesToShow
  const testimonialChunks = chunkArray(testimonials, slidesToShow);
  
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <Title level={2} className="text-white mb-4">
            Loved by thousands of professionals
          </Title>
          <Paragraph className="text-xl text-gray-400">
            See how Bestarz is transforming businesses across every service
            category
          </Paragraph>
        </div>
  
        <Carousel
          autoplay={{ dotDuration: true }}
          autoplaySpeed={4000}
          arrows
          dots={true}
          infinite={true}
          slidesToShow={1}
          slidesToScroll={1}
        >
          {testimonialChunks.map((chunk, idx) => (
            <div key={idx} className="px-12">
              <Row gutter={[32, 32]} justify="center ">
                {chunk.map((testimonial, index) => (
                  <Col xs={24} sm={12} lg={8} key={index}>
                    <Card
                      className="testimonial-card mx-auto max-w-3xl w-full bg-gray-900 border-none h-full flex flex-col justify-between"
                      style={{ minHeight: '280px' }} // Set a fixed min height
                    >
                      <div>
                        <div className="mb-4 rating-glow text-center">
                          <Rate
                            disabled
                            defaultValue={testimonial.rating}
                            className="text-sm"
                          />
                        </div>
                        <Paragraph className="text-gray-300 mb-6 text-lg text-center">
                          "{testimonial.text}"
                        </Paragraph>
                      </div>
  
                      <div className="flex items-center justify-center mt-auto">
                        <Avatar
                          src={testimonial.avatar}
                          size={48}
                          className="mr-4"
                        />
                        <div className="text-center">
                          <div className="text-white font-semibold">
                            {testimonial.name}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Carousel>
      </section>
    );
  }
  