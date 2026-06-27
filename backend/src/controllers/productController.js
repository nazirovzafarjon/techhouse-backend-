import { productsDB } from "../data/db.js"
import { v4 as uuid } from "uuid"

export async function getProducts(req, res) {
    try {
        const products = productsDB

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
        console.log(err);
    }
}


export async function getProduct(req, res) {
    try {
        const { id } = req.params;



        const product = productsDB.find((p) => p.id === p.id);

      
        if (!product) {
            console.log(`404: Product with ID ${id} not found.`);
            return res.status(404).json({
                success: false,
                message: "Product doesn't exist in db !!!"
            });
        }

  
        res.status(200).json({
            success: true,
            data: product
        });

    } catch (err) {
  
        console.error("Error in getProduct:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error !"
        });
    }
}
export const createProduct = (req, res) => {
    try {
        const { name, price, category, inStock, description, imageUrl } = req.body;

 
        if (!name || !price || !category) {
            return res.status(400).json({ message: "Name, price and category are required!" });
        }

        const newProduct = {
            id: uuid(), 
            name,
            price: Number(price), 
            category,
            inStock: Number(inStock) || 0,
            description,
            imageUrl,
            createdAt: new Date().toISOString()
        };

      
        productsDB.push(newProduct);

        res.status(201).json({
            success: true,
            message: "Product successfully added to db",
            product: newProduct
        });

    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};


export async function updateProduct(req, res) {

    try {
        const { id } = req.params

        const { name, price, category, inStock, description, imageUrl } = req.body;

        const index = productsDB.findIndex(p => p.id == id)

        if (index === -1) {
            return res.status(404).json({
                succes: false,
                message: "Error occured!, Product not found."
            })
        }

        productsDB[index].name = name || productsDB[index].name
        productsDB[index].price = price ?? productsDB[index].price;
        productsDB[index].category = category || productsDB[index].category;
        productsDB[index].description = description || productsDB[index].description;
        productsDB[index].imageUrl = imageUrl || productsDB[index].imageUrl;


        productsDB[index].inStock = inStock ?? productsDB[index].inStock;
        productsDB[index].createdAt = new Date().toISOString()

        return res.status(200).json({
            success: false,
            message: "Procuct succesfully updated !",
            data: productsDB[index]
        })

    } catch (err) {
      
        console.error("Update Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}
export async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
  
        const index = productsDB.findIndex(p => p.id == id);
   
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        productsDB.splice(index, 1);
    
        return res.status(200).json({
            success: true,
            message: "Mahsulot muvaffaqiyatli o'chirildi."
        });

    } catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }

}


