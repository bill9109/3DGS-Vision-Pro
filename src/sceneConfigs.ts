export interface SourceSettings {
    url: string;
    scale: { x: number, y: number, z: number };
    position: { x: number, y: number, z: number };
    rotation: { x: number, y: number, z: number };
}

export const sources: Record<string, SourceSettings> = {
    "chess": {
        url: 'https://lumalabs.ai/capture/797885d5-b6bf-4ee6-8714-9e6e209d5f55',
        scale: { x: 3, y: 3, z: 3 },
        position: { x: -2, y: 0, z: -3.5 },
        rotation: { x: 0, y: -0.8 , z: 0 }
    },
    "car": {
        url: 'https://lumalabs.ai/capture/5e1c803a-0123-4b1f-8f3f-971fb54b62d2',
        scale: { x: 3, y: 3, z: 3 },
        position: { x: -2, y: 1, z: 0 },
        rotation: { x: 0, y: 0 , z: 0 }
    },
    "tangbohu": {
        url: 'https://lumalabs.ai/capture/d2502abf-d2be-4fe3-af78-310c44feb983',
        scale: { x: 0.8, y: 0.8, z: 0.8 },
        position: { x: 2, y: 1, z: -4 },
        rotation: { x: 0, y: -0.8 , z: 0 }
    },
    "davinci": {
        url: 'https://lumalabs.ai/capture/12017ace-ed72-4845-86ef-3a3a267d8b27',
        scale: { x: 0.8, y: 0.8, z: 0.8 },
        position: { x: 0, y: 1, z: -4 },
        rotation: { x: 0, y: 2.4 , z: -0.15 }
    },
    "Gundam": {
        url: 'https://lumalabs.ai/capture/6dae3651-9987-4f53-ae19-b7134da09499',
        scale: { x: 1, y: 1, z: 1 },
        position: { x: 0, y: 1, z: -4 },
        rotation: { x: 0, y: 2.4 , z: -0.15 }
    },
    "subway": {
        url: 'https://lumalabs.ai/capture/B271FFF7-37DD-47B1-8921-6375CD069C91',
        scale: { x: 4, y: 4, z: 4 },
        position: { x: 0, y: 1, z: 0 },
        rotation: { x: 0, y: 0 , z: 0 }
    },
    "Grammy": {
        url: 'https://lumalabs.ai/capture/BBCE804E-3B50-490F-A86F-6E5C4094BAC0',
        scale: { x: 1, y: 1, z: 1 },
        position: { x: 0, y: 1, z: -3 },
        rotation: { x: 0, y: 0 , z: 0 }
    },
    "Baltimore": {
        url: 'https://lumalabs.ai/capture/5f21cd1d-d445-4238-9aec-9699fabdcfb0',
        scale: { x: 10, y: 10, z: 10 },
        position: { x: -8, y: -10, z: -25 },
        rotation: { x: -0.5, y: 4 , z: -0.3 }
    },
    "Baltimore1": {
        url: 'https://lumalabs.ai/capture/A6866DB1-E813-4C8A-8F72-70A3E49FC116',
        scale: { x: 10, y: 10, z: 10 },
        position: { x: -20, y: -20, z: -20 },
        rotation: { x: -0.5, y: 4 , z: -0.3 }
    },
    "teslabot": {
        url: 'https://lumalabs.ai/capture/68C3DB16-F7D7-49A8-9278-105D4CEBE6CD',
        scale: { x: 0.8, y: 0.8, z: 0.8 },
        position: { x: 0, y: 1, z: -4 },
        rotation: { x: 0, y: 2.5 , z: 0 }
    },
    "met": {
        url: 'https://lumalabs.ai/capture/6A1B0C89-15C1-4C7E-A708-7C6E4E2B5E54',
        scale: { x: 0.8, y: 0.8, z: 0.8 },
        position: { x: 0, y: 2, z: -1 },
        rotation: { x: 0, y: 0 , z: 0 }
    },
    "Einstein": {
        url: 'https://lumalabs.ai/capture/3af9315a-45be-4eb2-870e-d20ab0ee61f9',
        scale: { x: 1, y: 1, z: 1 },
        position: { x: 0, y: 1, z: -4 },
        rotation: { x: 0, y: 2.4 , z: -0.15 }
    },
    "hollywood": {
        url: 'https://lumalabs.ai/capture/b5faf515-7932-4000-ab23-959fc43f0d94',
        scale: { x: 1, y: 1, z: 1 },
        position: { x: 0, y: 1, z: -4 },
        rotation: { x: 0, y: 2.4 , z: -0.15 }
    },
    "KeithHaring": {
        url: 'https://lumalabs.ai/capture/1b185adf-82a5-4ad3-8ffe-9c4a54980772',
        scale: { x: 1, y: 1, z: 1 },
        position: { x: 0, y: 1, z: -4 },
        rotation: { x: 0, y: 2.4 , z: -0.15 }
    },
    "Science Orb": {
        url: 'https://lumalabs.ai/capture/65a3fc14-2ad1-4b81-b09d-bb79277a714c',
        scale: { x: 1, y: 1, z: 1 },
        position: { x: 0, y: 1, z: -4 },
        rotation: { x: 0, y: 2.4 , z: -0.15 }
    },
    "2024": {
        url: 'https://lumalabs.ai/capture/f896e5cb-702b-4225-9467-e61f19e47d46',
        scale: { x: 7, y: 7, z: 7 },
        position: { x: 5, y: 0, z: -20 },
        rotation: { x: -0.05, y: 2.2, z: 0.05 }
    },
    "may4th": {
        url: 'https://lumalabs.ai/capture/7adf27d9-a0d8-4a26-ac07-fda29b8b8dfb',
        scale: { x: 3, y: 3, z: 3 },
        position: { x: 2.3, y: 0, z: -6.5 },
        rotation: { x: 0, y: 2.5 , z: 0 }
    },
    "sanxingdui": {
        url: 'https://lumalabs.ai/capture/2efb212c-ac03-45c3-94e4-2dbae36561fe',
        scale: { x: 0.3, y: 0.3, z: 0.3 },
        position: { x: 0, y: 1, z: -1 },
        rotation: { x: 0, y: 3.7 , z: 0 }
    },
    "goldmask": {
        url: 'https://lumalabs.ai/capture/6935a527-34f4-4036-9799-be96a5482fe9',
        scale: { x: 0.3, y: 0.3, z: 0.3 },
        position: { x: 0, y: 1, z: -2 },
        rotation: { x: -0.3 , y: 1 , z: 0.15 }
    },
    "Sea_of_Buddha": {
        url: 'https://lumalabs.ai/capture/669839b8-9c0f-4193-bf36-e465d4d75e24',
        scale: { x: 3, y: 3, z: 3 },
        position: { x: 0, y: 1, z: -9 },
        rotation: { x: 0.02, y: 0.09 , z: 0 }
    },
    "xin_jing": {
        url: 'https://lumalabs.ai/capture/eab29aa6-fd5f-411e-86d3-f2d96016644e',
        scale: { x: 8, y: 8, z: 8 },
        position: { x: 0, y: 7, z: -20 },
        rotation: { x: 0.09, y: 0 , z: -0.01 }
    },
    "Tutankhamun": {
        url: 'https://lumalabs.ai/capture/dab01288-a30c-49e1-bfda-cd1ebe337f3f',
        scale: { x: 1.2, y: 1.2, z: 1.2 },
        position: { x: 0, y: 1, z: -4 },
        rotation: { x: 0, y: -3.1 , z: 0.02 }
    },
    "Amon": {
        url: 'https://lumalabs.ai/capture/5a589bc4-b6c3-449f-b9fb-349caf12f4a0',
        scale: { x: 1, y: 1, z: 1 },
        position: { x: 0, y: 1.5, z: -3 },
        rotation: { x: 0, y: 3.1 , z: 0.02 }
    },
    "YU7": {
        url: 'https://lumalabs.ai/capture/ec5a703a-a5a9-43eb-bea1-cd68d9604069',
        scale: { x: 2, y: 2, z: 2 },
        position: { x: 0.7, y: 0, z: -5.6 },
        rotation: { x: 0, y: 0.98 , z: -0.02 }
    },
    "SU7_Ultra_Prototype": {
        url: 'https://lumalabs.ai/capture/a0475955-517c-44fd-8016-7e936ad32e59',
        scale: { x: 3, y: 3, z: 3 },
        position: { x: -2, y: 0, z: -8 },
        rotation: { x: -0.01, y: 0 , z: 0.07 }
    },
};