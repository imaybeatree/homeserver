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
    return <p className="muted-text" style={{ textAlign: "center" }}>No popular shows available.</p>;
    }
    
    return(
            <Carousel
              opts={{
                align: "start",
              }}
            >
              <CarouselContent>
                {media.map((media) => (
                  <CarouselItem key={media.id}>
                    <div>
                        <CardContent className="carousel-card-pad">
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
