import {v4 as uuid} from "uuid"


export const users = [];

export const productsDB = [
    {
        id: uuid(),
        name: "Iphone 17 pro max",
        price: 1400,
        category: "Smartphones",
        inStock: 30,
        description: "The latest Iphone of the Apple company.",
        imageUrl: "https://castore.uz/upload/iblock/26a/hhw4naxewtlwi4b2tc40rc2cyal8h3ae/smartfon-apple-iphone-17-pro-max-512gb-deep-blue-mfyu4af-a-4.jpg",
        createdAt: new Date().toISOString()
    },
    {
        id: uuid(),
        name: "Mixer",
        price: 400,
        category: "Kitchen appliance",
        inStock: 100,
        description: "The mixer of the Samsung company.",
        imageUrl: "https://images.uzum.uz/d1fm77gs9rf1c8ko3pm0/original.jpg",
        createdAt: new Date().toISOString()
    },
    {
        id: uuid(),
        name: "Mackbook m4 Max",
        price: 3000,
        category: "Mackbook",
        inStock: 20,
        description: "The latest Iphone of the Apple company.",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBAZtKA_7I8bhsTfANGYsG00V1pR7p-twpVQ&s",
        createdAt: new Date().toISOString()
    },
]