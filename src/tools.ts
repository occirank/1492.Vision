import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios from "axios";
import { getApiKey } from "./sessionStore.js";

const BASE_URL = "https://beta.api.1492.vision";

// Helper function to make API calls to 1492.Vision api (GET or POST)
async function makeApiRequest(endpoint: string, params: Record<string, any> = {}, method: "GET" | "POST", apiKey: string): Promise<any> {
  if (!apiKey) {
    throw new Error("Api Key is not set");
  }

  const url = `${BASE_URL}${endpoint}`;

  try {
    let response;

    if (method.toUpperCase() === "GET") {
      response = await axios.get(url, {
        headers: {
          "Accept": "application/json",
          "content-type": "application/json",
          "access_token": apiKey
        },
        params,
      });
    } else if (method.toUpperCase() === "POST") {
      response = await axios.post(url, params, {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "access_token": apiKey
        },
      });
    } else {
      throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return response.data;

  } catch (error) {
    console.error("Error making 1492.Vision api request:", error);
    throw error;
  }
}

async function getApiKeyFromContext(context: any): Promise<string | null> {
  const sessionId = context?.sessionId;
  if (!sessionId) return null;
  return await getApiKey(sessionId);
}

const HostPatchParams = z.object({
  urls: z.array(z.string()).describe(""),
  days: z.number().int().describe("").default(-1),
  lang: z.string().describe("").default("fr")
});

const EntitiesBagRelatedEntitiesParams = z.object({
  bag_uuid: z.string().describe(""),
  lang: z.string().optional().describe(""),
  extra_entities: z.boolean().optional().describe("")
});

const EntitiesBagArticlesParams = z.object({
  bag_uuid: z.string().describe(""),
  days: z.number().int().optional().describe(""),
  lang: z.string().optional().describe("")
});

const EntitiesBagTopDomainsParams = z.object({
  bag_uuid: z.string().describe(""),
  days: z.number().int().optional().describe(""),
  lang: z.string().optional().describe("")
});

const WipLivetrendsParams = z.object({
  lang: z.string().optional().describe(""),
  min: z.number().int().optional().describe(""),
  no_thing: z.boolean().optional().describe(""),
  less_sport: z.boolean().optional().describe(""),
  topic_id: z.number().int().optional().describe("")
});

const WipHostFoldersParams = z.object({
  host: z.string().describe(""),
});

const WipHostArticlesParams = z.object({
  host: z.string().describe(""),
  days: z.number().int().optional().describe(""),
  lang: z.string().optional().describe(""),
  folder: z.string().optional().describe(""),
});

const WipUrlsParams = z.object({
  urls: z.array(z.string()).describe(""),
  days: z.number().int().describe("").default(-1),
  lang: z.string().describe("").default("fr")
});

const EntityArticlesParams = z.object({
  entity_id: z.string().describe(""),
  days: z.number().int().optional().describe(""),
  lang: z.string().optional().describe("")
});

const EntityRelatedEntitiesParams = z.object({
  entity_id: z.string().describe(""),
  days: z.number().int().optional().describe(""),
  lang: z.string().optional().describe("")
});

const Partner1HostBatchSimpleParams = z.object({
  urls: z.array(z.string()).describe("")
});

// Configuration function that adds all tools and prompts to a server instance
export function configureServer(server: McpServer) {

  // Tool to do simple authenticated test
  server.tool(
    "beta_test", 
    "Tool to do simple authenticated test.", 
    async (extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/beta/test", {}, "GET", apiKey);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    });

  // Tool returns the user quota (for API calls) remaining for the day
  server.tool(
    "beta_api_quota",
    "Tool returns the user quota (for API calls) remaining for the day.",
    async (extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/beta/api_quota", {}, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error getting keywords match: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the top 10 hosts with the most articles of the domain given from the urls list
  server.tool(
    "beta_host_batch",
    "Tool returns the top 10 hosts with the most articles of the domain given from the urls list.",
    HostPatchParams.shape,
    async (params: z.infer<typeof HostPatchParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "IndexMeNow API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/beta/host_batch", params, "POST", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the list of entities bags for the user
  server.tool(
    "beta_entities_bag_list",
    "Tool returns the list of entities bags for the user.",
    async (extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/beta/entities_bag/list", {}, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the list of related entities for the given bag
  server.tool(
    "beta_entities_bag_related_entities",
    "Tool returns the list of related entities for the given bag.",
    EntitiesBagRelatedEntitiesParams.shape,
    async (params: z.infer<typeof EntitiesBagRelatedEntitiesParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/beta/entities_bag/related_entities", params, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the latest articles for the given bag
  server.tool(
    "beta_entities_bag_latest_articles",
    "Tool returns the latest articles for the given bag.",
    EntitiesBagArticlesParams.shape,
    async (params: z.infer<typeof EntitiesBagArticlesParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/beta/entities_bag/latest_articles", params, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the best articles for the given bag
  server.tool(
    "beta_entities_bag_best_articles",
    "Tool returns the best articles for the given bag.",
    EntitiesBagArticlesParams.shape,
    async (params: z.infer<typeof EntitiesBagArticlesParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/beta/entities_bag/best_articles", params, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the top 20 domains for the given bag
  server.tool(
    "beta_entities_bag_top_domains",
    "ool returns the top 20 domains for the given bag.",
    EntitiesBagTopDomainsParams.shape,
    async (params: z.infer<typeof EntitiesBagTopDomainsParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/beta/entities_bag/top_domains", params, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool to get livetrends at different importance levels
  server.tool(
    "wip_livetrends",
    "Tool to get livetrends at different importance levels.",
    WipLivetrendsParams.shape,
    async (params: z.infer<typeof WipLivetrendsParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/wip/livetrends", params, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the folders for the given host
  server.tool(
    "wip_host_folders",
    "Tool returns the folders for the given host.",
    WipHostFoldersParams.shape,
    async (params: z.infer<typeof WipHostFoldersParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/wip/host/folders", params, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the latest articles for the given host
  server.tool(
    "wip_host_latest_articles",
    "Tool returns the latest articles for the given host.",
    WipHostArticlesParams.shape,
    async (params: z.infer<typeof WipHostArticlesParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/wip/host/latest_articles", params, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the best articles for the given host
  server.tool(
    "wip_host_best_articles",
    "ool returns the best articles for the given host.",
    WipHostArticlesParams.shape,
    async (params: z.infer<typeof WipHostArticlesParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/wip/host/best_articles", params, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the entities for the given urls (max 50 per call)
  server.tool(
    "wip_urls_entities",
    "Tool returns the entities for the given urls (max 50 per call).",
    WipUrlsParams.shape,
    async (params: z.infer<typeof WipUrlsParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/wip/urls/entities", params, "POST", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the topics for the given urls (max 50 per call)
  server.tool(
    "wip_urls_topics",
    "Tool returns the topics for the given urls (max 50 per call).",
    WipUrlsParams.shape,
    async (params: z.infer<typeof WipUrlsParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/wip/urls/topics", params, "POST", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the latest articles for the given entity
  server.tool(
    "wip_entity_latest_articles",
    "Tool returns the latest articles for the given entity.",
    EntityArticlesParams.shape,
    async (params: z.infer<typeof EntityArticlesParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/wip/entity/latest_articles", params, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the best articles for the given entity
  server.tool(
    "wip_entity_best_articles",
    "Tool returns the best articles for the given entity.",
    EntityArticlesParams.shape,
    async (params: z.infer<typeof EntityArticlesParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/wip/entity/best_articles", params, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error getting keywords match: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool returns the related entities for the given entity
  server.tool(
    "wip_entity_related_entities",
    "Tool returns the related entities for the given entity.",
    EntityRelatedEntitiesParams.shape,
    async (params: z.infer<typeof EntityRelatedEntitiesParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/wip/entity/related_entities", params, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool query the remaining daily quota and monthly quota used
  server.tool(
    "partner1_api_quota",
    "ool query the remaining daily quota and monthly quota used.",
    async (extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/partner1/api_quota", {}, "GET", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );

  // Tool batch query a list of urls or domains for inclusion of the domain in the db, all times, last 30 days and last 7 days
  server.tool(
    "partner1_host_batch_simple",
    "Tool batch query a list of urls or domains for inclusion of the domain in the db, all times, last 30 days and last 7 days.",
    Partner1HostBatchSimpleParams.shape,
    async (params: z.infer<typeof Partner1HostBatchSimpleParams>, extra: any) => {
      const apiKey = await getApiKeyFromContext(extra);
      if (!apiKey) {
        return {
          isError: true,
          content: [{ type: "text", text: "API key not found" }],
        };
      }
      try {
        const data = await makeApiRequest("/partner1/host_batch_simple", params, "POST", apiKey);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2)
            }
          ]
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    }
  );
}