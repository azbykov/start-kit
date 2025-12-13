# Example API Contract: Test Endpoint

**Purpose**: Example API endpoint for testing data fetching infrastructure during project setup.

**Note**: This is a placeholder endpoint to verify TanStack Query and Axios configuration. Real domain endpoints will be defined in later tasks.

## GET /api/example

Test endpoint that returns sample data to verify data fetching works correctly.

### Request

**Method**: `GET`  
**Path**: `/api/example`  
**Headers**: None required

### Response

**Status**: `200 OK`

**Body**:

```json
{
  "message": "API is working",
  "timestamp": "2025-11-29T12:00:00Z",
  "data": {
    "items": [
      { "id": 1, "name": "Item 1" },
      { "id": 2, "name": "Item 2" }
    ]
  }
}
```

### Error Responses

**Status**: `500 Internal Server Error`

**Body**:

```json
{
  "error": "Internal server error",
  "message": "Error description"
}
```

### TypeScript Types

```typescript
// Request types (none for GET)
// Response type
interface ExampleApiResponse {
  message: string;
  timestamp: string;
  data: {
    items: Array<{
      id: number;
      name: string;
    }>;
  };
}
```

### Usage in Components

```typescript
// Example usage with TanStack Query
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const { data, isLoading, error } = useQuery({
  queryKey: ["example"],
  queryFn: async () => {
    const response = await api.get<ExampleApiResponse>("/api/example");
    return response.data;
  },
});
```

---

## Future API Contracts

Real domain API contracts will be defined in later tasks:

- `/api/players` - Player CRUD operations
- `/api/teams` - Team operations
- `/api/matches` - Match operations
- `/api/tournaments` - Tournament operations
- `/api/auth` - Authentication (NextAuth integration)

All contracts will follow RESTful conventions and include:

- Request/response schemas
- Error handling
- Authentication requirements (when applicable)
- TypeScript type definitions
