import { createFileRoute } from '@tanstack/react-router';
import BathroomLamp from '../components/hardware/assets/BathroomLamp.jpeg';
import Bench from '../components/hardware/assets/bench.jpeg';
import ConcreteLamp from '../components/hardware/assets/concretelamp.jpg';
import Mirror from '../components/hardware/assets/mirror.jpg';
import Pillow from '../components/hardware/assets/pillow.jpeg';
import Bed from '../components/hardware/assets/bed.jpg';
import Bernd from '../components/hardware/assets/bernd.jpg';
import Bikewallmount from '../components/hardware/assets/bikewallmount.jpg';
import CurtainPole from '../components/hardware/assets/CurtainPole.jpg';
import Lamp from '../components/hardware/assets/Lamp.jpg';
import Pottery from '../components/hardware/assets/pottery.jpg';
import Potence01 from '../components/hardware/assets/potence01.jpg';
import Rack01 from '../components/hardware/assets/Rack01.jpg';
import Shades from '../components/hardware/assets/shades.jpg';

const images = [
  { src: BathroomLamp, alt: 'Scrapped bathroom lamp with Coffee Filter diffusor' },
  { src: Bench, alt: 'Wooden bench made from my dining table' },
  { src: ConcreteLamp, alt: 'Concrete Lamp, used milk carton as base' },
  { src: Mirror, alt: 'Backlit mirror' },
  { src: Pillow, alt: 'Pillow sewn from textile examples' },
  { src: Bed, alt: 'Bed and headboard made from cheap wood laths' },
  { src: Bernd, alt: 'Easy Chair made of an old couch, got new leather upholstery' },
  { src: Bikewallmount, alt: 'Simple wall mount for my bike' },
  { src: CurtainPole, alt: 'Hangers for my curtains made from heating pipes' },
  { src: Lamp, alt: 'Chandelier installation with an old painters ladder' },
  { src: Pottery, alt: 'Wheel thrown pottery' },
  { src: Potence01, alt: 'Potence inspired concept lamp made with bronze rods' },
  { src: Rack01, alt: 'IKEA compatible rack welded from steel rods' },
  { src: Shades, alt: 'Blocky paper shades A3/A4' },
];

export const Route = createFileRoute('/hardware')({
  component: HardwarePage,
});

function HardwarePage() {
  return (
    <main className="flex flex-col gap-4">
      <div className="flex h-[90vh] w-full items-center justify-center">
        <h1>Hardware Made by Me ↓</h1>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {images.map(({ src, alt }) => (
          <figure className="flex flex-col gap-2" key={src}>
            <img alt={alt} className="h-auto w-full" loading="lazy" src={src} />
            <figcaption className="text-sm text-gray-600">{alt}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
