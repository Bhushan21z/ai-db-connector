import { z } from "zod";
import { tool } from "@openai/agents";

// Helper to parse JSON strings in parameters
function parseJSONField(field) {
    if (typeof field === "string") {
        try {
            return JSON.parse(field);
        } catch {
            return field;
        }
    }
    return field;
}

export function createSupabaseTools(supabaseClient) {
    // const listTables = tool({
    //     name: "list_tables",
    //     description: "List all tables in the public schema of the database.",
    //     parameters: z.object({}),
    //     async execute() {
    //         console.log("---------------------------------------------------");
    //         console.log("Listing all tables");
    //         try {
    //             const { data, error } = await supabaseClient
    //                 .from('information_schema.tables')
    //                 .select('table_name')
    //                 .eq('table_schema', 'public');

    //             if (error) throw error;

    //             const names = data.map((t) => t.table_name);
    //             return {
    //                 status: "success",
    //                 operation: "list_tables",
    //                 data: names,
    //                 message: `Found ${names.length} table(s): ${names.join(", ") || "none"}`,
    //             };
    //         } catch (err) {
    //             console.error("❌ List tables error:", err);
    //             return {
    //                 status: "error",
    //                 operation: "list_tables",
    //                 data: null,
    //                 message: `Failed to list tables: ${err.message}`,
    //             };
    //         }
    //     },
    // });

    const selectRows = tool({
        name: "select_rows",
        description: "Select rows from a table with optional filters. Pass filters as a JSON object.",
        parameters: z.object({
            table: z.string().min(1).describe("The name of the table."),
            filters: z.string().describe("Filters as a JSON string. Example: '{\"id\": 1, \"status\": \"active\"}'"),
            limit: z.number().int().positive().max(1000).default(100).describe("Maximum number of rows to return."),
        }),
        async execute({ table, filters, limit }) {
            const parsedFilters = parseJSONField(filters);
            console.log("---------------------------------------------------");
            console.log(`Selecting rows from table: ${table} with filters:`, parsedFilters);
            try {
                let query = supabaseClient.from(table).select("*").limit(limit);

                if (parsedFilters) {
                    for (const [key, value] of Object.entries(parsedFilters)) {
                        query = query.eq(key, value);
                    }
                }

                const { data, error } = await query;
                if (error) throw error;

                return {
                    status: "success",
                    operation: "select",
                    table,
                    data,
                    count: data.length,
                    message: `Found ${data.length} row(s).`,
                };
            } catch (err) {
                console.error("❌ Select error:", err);
                return {
                    status: "error",
                    operation: "select",
                    table,
                    data: null,
                    message: `Failed to select rows: ${err.message}`,
                };
            }
        },
    });

    const insertRow = tool({
        name: "insert_row",
        description: "Insert a row into a table. Pass the row data as a JSON object.",
        parameters: z.object({
            table: z.string().min(1).describe("The name of the table."),
            data: z.string().describe("The row data to insert as a JSON string. Example: '{\"name\": \"John\", \"age\": 30}'"),
        }),
        async execute({ table, data }) {
            const parsedData = parseJSONField(data);
            console.log("---------------------------------------------------");
            console.log(`Inserting row into table: ${table}`);
            try {
                const { data: result, error } = await supabaseClient
                    .from(table)
                    .insert([parsedData])
                    .select()
                    .single();

                if (error) throw error;

                return {
                    status: "success",
                    operation: "insert",
                    table,
                    data: result,
                    message: `Row inserted successfully.`,
                };
            } catch (err) {
                console.error("❌ Insert error:", err);
                return {
                    status: "error",
                    operation: "insert",
                    table,
                    data: null,
                    message: `Failed to insert row: ${err.message}`,
                };
            }
        },
    });

    const updateRow = tool({
        name: "update_row",
        description: "Update rows in a table matching a filter. Pass filter and data as JSON objects.",
        parameters: z.object({
            table: z.string().min(1).describe("The name of the table."),
            filter: z.string().describe("Filter to match rows as a JSON string. Example: '{\"id\": 1}'"),
            data: z.string().describe("The fields to update as a JSON string. Example: '{\"status\": \"inactive\"}'"),
        }),
        async execute({ table, filter, data }) {
            const parsedFilter = parseJSONField(filter);
            const parsedData = parseJSONField(data);
            console.log("---------------------------------------------------");
            console.log(`Updating rows in table: ${table}`);
            try {
                let query = supabaseClient.from(table).update(parsedData);

                for (const [key, value] of Object.entries(parsedFilter)) {
                    query = query.eq(key, value);
                }

                const { data: result, error } = await query.select();
                if (error) throw error;

                return {
                    status: "success",
                    operation: "update",
                    table,
                    data: result,
                    affected: result.length,
                    message: `Updated ${result.length} row(s).`,
                };
            } catch (err) {
                console.error("❌ Update error:", err);
                return {
                    status: "error",
                    operation: "update",
                    table,
                    data: null,
                    message: `Failed to update row: ${err.message}`,
                };
            }
        },
    });

    const deleteRow = tool({
        name: "delete_row",
        description: "Delete rows from a table matching a filter. Pass filter as a JSON object.",
        parameters: z.object({
            table: z.string().min(1).describe("The name of the table."),
            filter: z.string().describe("Filter to match rows for deletion as a JSON string. Example: '{\"id\": 1}'"),
        }),
        async execute({ table, filter }) {
            const parsedFilter = parseJSONField(filter);
            console.log("---------------------------------------------------");
            console.log(`Deleting rows from table: ${table}`);
            try {
                let query = supabaseClient.from(table).delete();

                for (const [key, value] of Object.entries(parsedFilter)) {
                    query = query.eq(key, value);
                }

                const { data: result, error } = await query.select();
                if (error) throw error;

                return {
                    status: "success",
                    operation: "delete",
                    table,
                    data: result,
                    affected: result.length,
                    message: `Deleted ${result.length} row(s).`,
                };
            } catch (err) {
                console.error("❌ Delete error:", err);
                return {
                    status: "error",
                    operation: "delete",
                    table,
                    data: null,
                    message: `Failed to delete row: ${err.message}`,
                };
            }
        },
    });

    // const executeSql = tool({
    //     name: "execute_sql",
    //     description: "Execute a raw PostgreSQL query on the database. Use this for complex queries, joins, or when other tools are insufficient. Always try to be safe and precise with your SQL.",
    //     parameters: z.object({
    //         sql: z.string().min(1).describe("The raw SQL query to execute."),
    //     }),
    //     async execute({ sql }) {
    //         console.log("---------------------------------------------------");
    //         console.log(`Executing SQL: ${sql}`);
    //         try {
    //             // We use a custom RPC 'exec_sql' which the user must add to their Supabase project
    //             const { data, error } = await supabaseClient.rpc('exec_sql', { sql_query: sql });

    //             if (error) throw error;

    //             return {
    //                 status: "success",
    //                 operation: "execute_sql",
    //                 data,
    //                 message: `Query executed successfully.`,
    //             };
    //         } catch (err) {
    //             console.error("❌ SQL execution error:", err);
    //             return {
    //                 status: "error",
    //                 operation: "execute_sql",
    //                 data: null,
    //                 message: `Failed to execute SQL: ${err.message}`,
    //             };
    //         }
    //     },
    // });

    return [
        // listTables,
        selectRows,
        insertRow,
        updateRow,
        deleteRow,
        // executeSql,
    ];
}
