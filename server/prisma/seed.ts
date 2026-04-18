import {PrismaPg} from '@prisma/adapter-pg';
import {PrismaClient} from '../src/prisma/generated/client.js';
import argon2 from 'argon2';

const adapter = new PrismaPg({connectionString: process.env.DATABASE_URL!});
const prisma = new PrismaClient({adapter});

async function main() {
    const passwordHash = await argon2.hash('password123!@#');
    const admin = await prisma.user.upsert({
        where: {email: 'admin@apihub.com'},
        update: {},
        create: {
            email: 'admin@apihub.com',
            username: 'admin',
            passwordHash,
            role: 'ADMIN',
            isEmailVerified: true,
        },
    });
    console.log(`Admin user: ${admin.email}`);

    const categories = await Promise.all([
        prisma.category.upsert({
            where: {name: 'Weather'},
            update: {},
            create: {name: 'Weather', description: 'Weather forecasts and climate data'}
        }),
        prisma.category.upsert({
            where: {name: 'Finance'},
            update: {},
            create: {name: 'Finance', description: 'Stock prices, currencies, and financial data'}
        }),
        prisma.category.upsert({
            where: {name: 'Geolocation'},
            update: {},
            create: {name: 'Geolocation', description: 'IP and address geolocation services'}
        }),
        prisma.category.upsert({
            where: {name: 'AI & ML'},
            update: {},
            create: {name: 'AI & ML', description: 'Machine learning and AI services'}
        }),
        prisma.category.upsert({
            where: {name: 'Communication'},
            update: {},
            create: {name: 'Communication', description: 'Email, SMS, and messaging APIs'}
        }),
        prisma.category.upsert({
            where: {name: 'Media'},
            update: {},
            create: {name: 'Media', description: 'Images, video, and audio services'}
        }),
        prisma.category.upsert({
            where: {name: 'Developer'},
            update: {},
            create: {name: 'Developer', description: 'Tools and utilities for developers'}
        }),
    ]);

    const cat = Object.fromEntries(categories.map(c => [c.name, c.id]));
    console.log(`Categories: ${categories.map(c => c.name).join(', ')}`);

    // APIs
    const apis = [
        {
            name: 'Open-Meteo',
            description: 'Free weather API with hourly and daily forecasts, historical data, and climate projections. No API key required.',
            url: 'https://api.open-meteo.com',
            categoryId: cat['Weather'],
            isHttps: true,
            corsStatus: 'AVAILABLE' as const,
            isFree: true,
            authType: 'NONE' as const
        },
        {
            name: 'OpenWeatherMap',
            description: 'Current weather, forecasts, historical data, and weather maps for any location in the world.',
            url: 'https://api.openweathermap.org',
            categoryId: cat['Weather'],
            isHttps: true,
            corsStatus: 'AVAILABLE' as const,
            isFree: false,
            authType: 'API_KEY' as const
        },
        {
            name: 'Alpha Vantage',
            description: 'Real-time and historical stock market data, forex rates, and cryptocurrency exchange rates.',
            url: 'https://www.alphavantage.co',
            categoryId: cat['Finance'],
            isHttps: true,
            corsStatus: 'UNKNOWN' as const,
            isFree: false,
            authType: 'API_KEY' as const
        },
        {
            name: 'ExchangeRate-API',
            description: 'Simple and reliable currency exchange rates API with 160+ currencies. Free tier available.',
            url: 'https://api.exchangerate-api.com',
            categoryId: cat['Finance'],
            isHttps: true,
            corsStatus: 'AVAILABLE' as const,
            isFree: true,
            authType: 'API_KEY' as const
        },
        {
            name: 'ip-api',
            description: 'Fast and accurate IP geolocation API returning country, region, city, ISP, and more. No key needed for non-commercial use.',
            url: 'http://ip-api.com',
            categoryId: cat['Geolocation'],
            isHttps: false,
            corsStatus: 'AVAILABLE' as const,
            isFree: true,
            authType: 'NONE' as const
        },
        {
            name: 'ipinfo.io',
            description: 'Trusted IP data provider with geolocation, ASN, carrier, and privacy detection.',
            url: 'https://ipinfo.io',
            categoryId: cat['Geolocation'],
            isHttps: true,
            corsStatus: 'AVAILABLE' as const,
            isFree: false,
            authType: 'API_KEY' as const
        },
        {
            name: 'OpenAI',
            description: 'Access GPT-4, DALL-E, Whisper, and Embeddings models. The industry-standard AI API.',
            url: 'https://api.openai.com',
            categoryId: cat['AI & ML'],
            isHttps: true,
            corsStatus: 'UNAVAILABLE' as const,
            isFree: false,
            authType: 'API_KEY' as const
        },
        {
            name: 'Hugging Face Inference',
            description: 'Run thousands of open-source ML models for NLP, vision, and audio via a unified REST API.',
            url: 'https://api-inference.huggingface.co',
            categoryId: cat['AI & ML'],
            isHttps: true,
            corsStatus: 'AVAILABLE' as const,
            isFree: true,
            authType: 'API_KEY' as const
        },
        {
            name: 'Mailgun',
            description: 'Transactional email API for developers. Send, receive, and track email at scale.',
            url: 'https://api.mailgun.net',
            categoryId: cat['Communication'],
            isHttps: true,
            corsStatus: 'UNAVAILABLE' as const,
            isFree: false,
            authType: 'API_KEY' as const
        },
        {
            name: 'Twilio',
            description: 'Programmable SMS, voice, video, and authentication APIs trusted by millions of developers.',
            url: 'https://api.twilio.com',
            categoryId: cat['Communication'],
            isHttps: true,
            corsStatus: 'UNAVAILABLE' as const,
            isFree: false,
            authType: 'API_KEY' as const
        },
        {
            name: 'Unsplash',
            description: 'Access over 3 million free high-resolution photos from the Unsplash community via REST API.',
            url: 'https://api.unsplash.com',
            categoryId: cat['Media'],
            isHttps: true,
            corsStatus: 'AVAILABLE' as const,
            isFree: true,
            authType: 'API_KEY' as const
        },
        {
            name: 'Pexels',
            description: 'Free stock photos and videos from Pexels. Full resolution, no attribution required.',
            url: 'https://api.pexels.com',
            categoryId: cat['Media'],
            isHttps: true,
            corsStatus: 'AVAILABLE' as const,
            isFree: true,
            authType: 'API_KEY' as const
        },
        {
            name: 'GitHub REST API',
            description: 'Integrate with GitHub repositories, issues, pull requests, users, and more. The definitive developer platform API.',
            url: 'https://api.github.com',
            categoryId: cat['Developer'],
            isHttps: true,
            corsStatus: 'AVAILABLE' as const,
            isFree: true,
            authType: 'OAUTH' as const
        },
        {
            name: 'JSONPlaceholder',
            description: 'Free fake REST API for testing and prototyping. Returns realistic JSON data for posts, users, todos, and more.',
            url: 'https://jsonplaceholder.typicode.com',
            categoryId: cat['Developer'],
            isHttps: true,
            corsStatus: 'AVAILABLE' as const,
            isFree: true,
            authType: 'NONE' as const
        },
    ];

    let created = 0;
    for (const api of apis) {
        const existing = await prisma.api.findFirst({where: {name: api.name}});
        if (!existing) {
            await prisma.api.create({data: api});
            created++;
        }
    }
    console.log(`APIs: ${created} created, ${apis.length - created} already existed`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
