import { IProductInteractors } from "../../interfaces/product/IProductInteractors";

export class ProductQueueController {
    private interactor: IProductInteractors;

    constructor(interactor: IProductInteractors) {
        this.interactor = interactor;
    }

    getProducts = async()  => {
        console.log("getProducts called");
    }   

}