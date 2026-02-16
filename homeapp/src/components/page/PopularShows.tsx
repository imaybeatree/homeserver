import { useIsMobile } from "@/hooks/use-mobile";
import { CardContent } from "../ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "../ui/carousel"
import PosterCard from "./PosterCard"
import type { Media } from "./types"

interface PopularShowsProps {
  media: Media[];
  handleMovieClick: (media: Media) => void;
}

export const PopularShows: React.FC<PopularShowsProps> = ({ media, handleMovieClick }) => {

    const isMobile = useIsMobile()

    if (!media || media.length === 0) {
    return <p className="text-gray-400 text-center">No popular shows available.</p>;
    }
    
    return(
            <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {media.map((media) => (
                  <CarouselItem key={media.id} className="basis-[45%] md:basis-1/3 lg:basis-1/4 pl-2">
                    <div>
                        <CardContent className="flex items-center justify-center md:!px-6 !px-1">
                            <PosterCard 
                              key={media.id}
                              media={media}
                              onClick={handleMovieClick}
                               />
                        </CardContent>

                    </div>
                  </CarouselItem>
                ))}
     
      </CarouselContent>
        {!isMobile && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
        
            </Carousel>
    )
}