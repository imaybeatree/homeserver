import { useIsMobile } from "@/hooks/use-mobile";
import { CardContent } from "../ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "../ui/carousel"
import PosterCard from "./PosterCard"
import type { Media } from "./types"

interface PopularShowsProps {
  media: Media[];
  handleMovieClick: (media: Media) => void;
  getProgress?: (media: Media) => { season: string; episode: string } | null;
}

export const PopularShows: React.FC<PopularShowsProps> = ({ media, handleMovieClick, getProgress }) => {

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
                              progress={getProgress ? getProgress(media) : null}
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
