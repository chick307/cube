import { ImageService } from './image-service';

const rejectedPromise = Promise.reject(Error());

rejectedPromise.catch(() => {});

export const createImageService = () => {
    const imageService: ImageService = {
        loadBlob: () => rejectedPromise,
        loadImage: () => rejectedPromise,
    };

    return { imageService };
};
