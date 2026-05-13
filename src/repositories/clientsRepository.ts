import { knex } from "../schema";

export type Client = {
    id: number;
    name: string;
    address: string | null;
    cpf: string | null;
    phone: string | null;
    phone_2: string | null;
    created_at: Date;
}

export type NewClient = Pick<Client, "name"> &
    Partial<Pick<Client, "address" | "cpf" | "phone" | "phone_2">>;

export type UpdateClient = Pick<Client, "id"> &
    Partial<Omit<Client, "id" | "created_at">>;

export class ClientsRepository {
    async getAll(): Promise<Client[] | false> {
        try {
            return await knex("clients").select("*").orderBy("id", "desc");
        } catch {
            return false;
        }
    }

    async get(clientId: number): Promise<Client | false> {
        try {
            const client = await knex("clients").where("id", clientId).first();
            return client ?? false;
        } catch {
            return false;
        }
    }

    async set(client: NewClient): Promise<boolean> {
        try {
            await knex("clients").insert({
                name: client.name,
                address: client.address ?? null,
                cpf: client.cpf ?? null,
                phone: client.phone ?? null,
                phone_2: client.phone_2 ?? null,
            });
            return true;
        } catch {
            return false;
        }
    }

    async update(client: UpdateClient): Promise<boolean> {
        try {
            const { id, ...rest } = client;
            await knex("clients").where("id", id).update(rest);
            return true;
        } catch {
            return false;
        }
    }

    async delete(clientId: number): Promise<boolean> {
        try {
            await knex("clients").where("id", clientId).del();
            return true;
        } catch {
            return false;
        }
    }
}

export const clientsRepository = new ClientsRepository();
