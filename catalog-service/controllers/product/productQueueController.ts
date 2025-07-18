import { IProductInteractors } from "../../interfaces/product/IProductInteractors";

export class ProductQueueController {
    private interactor: IProductInteractors;

    constructor(interactor: IProductInteractors) {
        this.interactor = interactor;
    }

    productKafkaEventCall = async()  => {
        console.log("Product Kafka Event Call");
    }   

}