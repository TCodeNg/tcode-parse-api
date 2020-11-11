export interface Product {
    category: string[]
    images: Image[]
    price: Price
    agent: Agent
    owner: Owner
    rating: Rating
    productId: string
    title: string
    type: string
    description: string
    status: string
    createdAt: string
    updatedAt: string
    objectId: string
}

export interface Image {
    image: string
    thumb: string
    public_Id: string
    width: number
    height: number
}

export interface Price {
    value: number
    currency: string
}

export interface Agent {
    id: string
    title: string
}

export interface Owner {
    id: string
    title: string
}

export interface Rating {
    totalRatings: number
    totalScore: number
    userScore: number
}
