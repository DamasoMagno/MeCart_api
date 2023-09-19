import { Router } from "express";
import { z } from "zod";
export const productRoute = Router();

import { prisma } from "../lib/prisma";
import { authenticateUser } from "../middlwares/authenticate";

productRoute.use(authenticateUser);

productRoute.get('/:productId', async (req, res) => {
  const paramsSchema = z.object({
    productId: z.string(),
  });

  const { productId } = paramsSchema.parse(req.params);

  const product = await prisma.product.findUniqueOrThrow({
    where: {
      id: productId
    }
  });

  return res.status(200).send(product);
});

productRoute.post('/', async (request, response) => {
  const cartSchema = z.object({
    name: z.string(),
    price: z.number().min(0),
    quantity: z.number().min(1),
    cartId: z.string().uuid(),
  });

  const { name, price, quantity, cartId } = cartSchema.parse(request.body);

  await prisma.product.create({
    data: {
      name,
      price,
      quantity,
      cartId
    }
  });

  return response.status(201).send();
})

productRoute.delete('/:productId', async (request, response) => {
  const paramsSchema = z.object({
    productId: z.string(),
  });

  const { productId } = paramsSchema.parse(request.params);

  const productExists = await prisma.product.findFirst({
    where: {
      id: productId
    }
  });

  if (!productExists) {
    return response.status(400).send({ message: "Product already removed" });
  }

  await prisma.product.delete({
    where: {
      id: productId
    }
  });

  return response.status(204).send();
});

productRoute.patch('/:productId', async (request, response) => {
  const findProductSchema = z.object({
    productId: z.string(),
  });

  const cartSchema = z.object({
    name: z.string().optional(),
    price: z.number().optional(),
    quantity: z.number().optional(),
  });

  const { productId } = findProductSchema.parse(request.params);
  const product = cartSchema.parse(request.body);

  await prisma.product.update({
    where: {
      id: productId
    },
    data: { ...product }
  });

  return response.status(204).send();
}
);