import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import Layout from "@components/Layout";
import Socials from "@components/Socials";
import JoinUs from "@components/JoinUs";
import FeaturedGuides from "@components/FeaturedGuides";
import EventsSlider from "@components/EventsSlider";
import AnimatedBanner from "@components/AnimatedBanner";
import ListingEvents from "@components/ListingEvents";
import Meta from "@components/Meta";
import { getFeaturedGuides } from "@models/guide";
import { Guide, Event, Costume } from "@models/types";
import { getCurrentEvents, getFutureEvents } from "@models/event";
import { formatDistanceToNow } from "date-fns";
import { useMedia } from "react-use";
import { getAllCostumes } from "@models/character";
import CostumeArtwork from "@components/CostumeArtwork";
import urlSlug from "url-slug";

const DailyInfoWithNoSSR = dynamic(() => import("../components/DailyQuests"), {
  ssr: false,
});

interface HomeProps {
  featuredGuides: Guide[];
  currentEvents: Event[];
  futureEvents: Event[];
  endingEvents: Event[];
  recentCostumes: Costume[];
}

export default function Home({
  featuredGuides = [],
  currentEvents = [],
  futureEvents = [],
  endingEvents = [],
  recentCostumes = [],
}: HomeProps): JSX.Element {
  const isMobile = useMedia("(max-width: 1279px)");

  return (
    <Layout>
      <Meta />

      <div className="flex flex-col gap-x-12 gap-y-16 md:gap-y-32">
        {!isMobile && <AnimatedBanner />}
        <EventsSlider currentEvents={currentEvents} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {futureEvents.length > 0 && (
            <ListingEvents title="Upcoming Events">
              {futureEvents.slice(0, 3).map((event) => (
                <Link
                  key={event.slug}
                  href={`/event/${event.slug}`}
                  passHref={true}
                >
                  <a className="slider__other-event">
                    <div className="border-2 border-beige-text border-opacity-60 hover:border-beige transition-colors relative select-none h-32">
                      <div className="absolute bottom-0 w-full p-2 bg-grey-lighter bg-opacity-70 z-20 flex justify-center gap-x-3">
                        <span>
                          Starts{" "}
                          {formatDistanceToNow(new Date(event.start_date), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <Image
                        layout="fill"
                        objectFit="cover"
                        height={128}
                        width={232}
                        src={
                          event.image.formats?.medium?.url ??
                          event.image.formats?.small.url ??
                          event.image.formats?.thumbnail?.url
                        }
                        alt={`Thumbnail ${event.title}`}
                        placeholder="blur"
                        blurDataURL={
                          event.image.formats?.medium?.hash ??
                          event.image.formats?.small.hash ??
                          event.image.formats?.thumbnail?.hash
                        }
                      />
                    </div>
                  </a>
                </Link>
              ))}
            </ListingEvents>
          )}

          {endingEvents.length > 0 && (
            <ListingEvents title="Events Ending soon">
              {endingEvents.map((event) => (
                <Link
                  key={event.slug}
                  href={`/event/${event.slug}`}
                  passHref={true}
                >
                  <a className="slider__other-event">
                    <div className="border-2 border-beige-text border-opacity-60 hover:border-beige transition-colors relative select-none h-32">
                      <div className="absolute bottom-0 w-full p-2 bg-grey-lighter bg-opacity-70 z-20 flex justify-center gap-x-3">
                        <span>
                          Ends{" "}
                          {formatDistanceToNow(new Date(event.end_date), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <Image
                        layout="fill"
                        objectFit="cover"
                        height={128}
                        width={232}
                        src={
                          event.image.formats?.medium?.url ??
                          event.image.formats?.small.url ??
                          event.image.formats?.thumbnail?.url
                        }
                        alt={`Thumbnail ${event.title}`}
                        placeholder="blur"
                        blurDataURL={
                          event.image.formats?.medium?.hash ??
                          event.image.formats?.small.hash ??
                          event.image.formats?.thumbnail?.hash
                        }
                      />
                    </div>
                  </a>
                </Link>
              ))}
            </ListingEvents>
          )}
        </div>
        <section>
          <h2 className="overlap">New costumes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentCostumes.map((costume) => (
              <div className="relative" key={costume.ids.costume}>
                <h3 className="text-2xl text-beige text-center">
                  {costume.character.en} - {costume.costume.name.en}
                </h3>
                <CostumeArtwork costume={costume} />
                <Link
                  href={`/characters/${urlSlug(costume.character.en)}/${urlSlug(
                    costume.costume.name.en
                  )}`}
                  passHref
                >
                  <a className="btn absolute z-50 -bottom-2 transform -translate-x-1/2 left-1/2">
                    See costume
                  </a>
                </Link>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Link href="/characters" passHref>
              <a className="btn mt-12">See all costumes</a>
            </Link>
          </div>
        </section>
        <DailyInfoWithNoSSR />
        <FeaturedGuides guides={featuredGuides} />
        <Socials />
        <JoinUs />
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const [featuredGuides, currentEvents, futureEvents, allCostumes] =
    await Promise.all([
      getFeaturedGuides(),
      getCurrentEvents({ currentDate: new Date().toISOString() }),
      getFutureEvents({ currentDate: new Date().toISOString() }),
      getAllCostumes({ allStats: false }),
    ]);

  const releasedCostumes = allCostumes.filter(
    (costume) => costume.metadata.releaseDate
  );

  const recentCostumes = releasedCostumes
    .sort(
      (a, b) =>
        new Date(b.metadata.releaseDate).getTime() -
        new Date(a.metadata.releaseDate).getTime()
    )
    .slice(0, 4);

  const endingEvents = [...currentEvents]
    .sort(
      (a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
    )
    .slice(0, 3);

  return {
    props: {
      featuredGuides,
      currentEvents,
      futureEvents,
      endingEvents,
      recentCostumes,
    },
    revalidate: 60,
  };
}
