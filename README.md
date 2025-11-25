# 1492VISION MCP SERVER – N8N Setup  

This guide explains how to integrate **1492vision MCP Server** into your **n8n workflows**. By following the steps below, you’ll set up a workflow that allows AI-powered message handling, context management, and tool execution via MCP.  

---

## 1. Workflow Overview  

The basic n8n workflow requires **5 nodes**:  

1. **When Chat Message Received Node**  
2. **AI Agent Node**  
3. **Chat Model Node**  
4. **Simple Memory Node**  
5. **MCP Client Node**  

---

## 2. How the Workflow Works  

This n8n workflow enables an AI-powered system to intelligently process chat messages and execute tools dynamically using **MCP**.

1. **Chat Message Received**  
   - The workflow starts when a new chat message is captured by the **When Chat Message Received** node.  

2. **AI Agent Activation**  
   - The message is passed to an **AI Agent**, which interprets intent and coordinates next steps.  

3. **Language Understanding (Chat Model)**  
   - A **Chat Model** node (LLM) processes the message, using context and memory to understand user intent.  

4. **Context Management (Simple Memory)**  
   - The **Simple Memory** node stores/retrieves relevant context, ensuring smooth continuity across conversations.  

5. **MCP Client Node**  
   - Handles both listing available tools and executing them.  
   - The AI Agent first requests the available tools, then selects one with parameters for execution.  

---

## 3. Workflow Credentials Setup  

### 3.1 Chat Model Node  
- Recommended Model: **Claude Sonnet 3.5 (or higher)**.  
- Steps:  
  1. Open Chat Model configuration.  
  2. Credential to connect with: Click **+ Create a new credential**.  
  3. Choose a name for your model credential.  
  4. Paste your LLM API key in the **API Key** field.  
  5. Click **Save**.  

### 3.2 MCP Client Tool Node  
- Steps:  
  1. Open MCP Client Node configuration.  
  2. Set **Server Transport** to **Server Sent Events**.
  3. Set **Authentication** to **Header Auth**.  
  4. Credential for Header Auth: Click **+ Create new credential**.  
  5. Use the following details:  
     - **Name**: `Access_Token`  
     - **Value**: `your_1492_api_key`  
  6. Click **Save**.  

---

## 4. Workflow Nodes Setup  

### 4.1 When Chat Message Received Node  
- Click **+** in the top-right of the UI.  
- Search for **When Chat Message Received** node.  
- Add it to the workflow.  

### 4.2 AI Agent Node  
- Add the **AI Agent** node and connect it to the **Chat Message Received** node.  
- Configure as follows:  
  - **Source for Prompt (User Message):** Connected Chat Trigger Node  
  - **Prompt (User Message):** `{{ $json.chatInput }}`    

### 4.3 Chat Model Node  
- Add a **Chat Model** node (e.g., Anthropic Chat Model).  
- Connect it to the **AI Agent** node.  
- Configure as follows:  
  - **Credential to connect with:** Select the one you created.  
  - **Model:** `Claude Sonnet 3.5` (or above).  

### 4.4 Simple Memory Node  
- Add a **Simple Memory** node.  
- Connect it to the **AI Agent** node.  

### 4.5 MCP Client Node  
- Add an **MCP Client Tool** node.  
- Connect it to the **AI Agent** node.  
- Configure as follows:  
  - **Endpoint:** `https://1492vision-production.up.railway.app/sse` 
  - **Server Transport:** Server Sent Events 
  - **Authentication:** Header Auth  
  - **Credential for Header Auth:** Select the MCP credential you created earlier.  
  - **Tools to Include:** All  

---

## 5. Workflow Test  

Once the workflow is fully set up:  
1. Click **Save**.  
2. Start testing by entering prompts into your connected system.  

---

## Support  

For questions, suggestions, or improvements, please contact:  
📧 **dev.occirank@gmail.com**  