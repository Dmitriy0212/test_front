import About from "@/components/About/About";
import Creators from "@/components/Creators/Creators";
import Hero from "@/components/Hero/Hero";
import PopularArticles from "@/components/PopularArticles/PopularArticles";

export default function HomePage() {
  return (
    <div className="container">
      <Hero />
      <About />
      <PopularArticles />
      <Creators />
    </div>
  );
}
