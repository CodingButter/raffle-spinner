#!/usr/bin/env ts-node

/**
 * Directus API Collection Management Script (TypeScript)
 * 
 * This script demonstrates how to create, update, and manage collections
 * via the Directus API with full type safety.
 */

interface DirectusAuth {
  access_token: string;
  expires: number;
  refresh_token: string;
}

interface DirectusCollection {
  collection: string;
  meta?: {
    singleton?: boolean;
    icon?: string;
    display_template?: string;
    hidden?: boolean;
    note?: string;
    accountability?: 'all' | 'activity' | null;
    color?: string;
    item_duplication_fields?: string[];
    sort_field?: string;
    archive_field?: string;
    archive_value?: string;
    unarchive_value?: string;
    archive_app_filter?: boolean;
    translation?: any;
  };
  schema?: {
    name?: string;
    comment?: string;
  };
  fields?: DirectusField[];
}

interface DirectusField {
  field: string;
  type: string;
  meta?: {
    interface?: string;
    display?: string;
    display_options?: any;
    readonly?: boolean;
    hidden?: boolean;
    sort?: number;
    width?: 'half' | 'full';
    group?: string;
    note?: string;
    translation?: any;
    required?: boolean;
    options?: any;
  };
  schema?: {
    default_value?: any;
    is_nullable?: boolean;
    is_unique?: boolean;
    is_primary_key?: boolean;
    has_auto_increment?: boolean;
    foreign_key_column?: string;
    foreign_key_table?: string;
    comment?: string;
  };
}

class DirectusCollectionManager {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string = process.env.DIRECTUS_URL || 'https://admin.drawday.app') {
    this.baseUrl = baseUrl;
  }

  /**
   * Authenticate with Directus
   */
  async authenticate(email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (data.data?.access_token) {
        this.token = data.data.access_token;
        console.log('✅ Authentication successful');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('❌ Authentication error:', error);
      throw error;
    }
  }

  /**
   * Create a new collection
   */
  async createCollection(collectionData: DirectusCollection): Promise<any> {
    if (!this.token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${this.baseUrl}/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(collectionData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('✅ Collection created:', collectionData.collection);
        return data.data;
      } else {
        throw new Error(data.errors?.[0]?.message || 'Failed to create collection');
      }
    } catch (error) {
      console.error('❌ Error creating collection:', error);
      throw error;
    }
  }

  /**
   * Create a field in a collection
   */
  async createField(collection: string, fieldData: DirectusField): Promise<any> {
    if (!this.token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${this.baseUrl}/fields/${collection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(fieldData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`✅ Field "${fieldData.field}" created in "${collection}"`);
        return data.data;
      } else {
        throw new Error(data.errors?.[0]?.message || 'Failed to create field');
      }
    } catch (error) {
      console.error('❌ Error creating field:', error);
      throw error;
    }
  }

  /**
   * Update a collection
   */
  async updateCollection(collection: string, updates: Partial<DirectusCollection>): Promise<any> {
    if (!this.token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${this.baseUrl}/collections/${collection}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(`✅ Collection "${collection}" updated`);
        return data.data;
      } else {
        throw new Error(data.errors?.[0]?.message || 'Failed to update collection');
      }
    } catch (error) {
      console.error('❌ Error updating collection:', error);
      throw error;
    }
  }

  /**
   * Get all collections
   */
  async getCollections(): Promise<DirectusCollection[]> {
    if (!this.token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${this.baseUrl}/collections`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        return data.data;
      } else {
        throw new Error('Failed to get collections');
      }
    } catch (error) {
      console.error('❌ Error getting collections:', error);
      throw error;
    }
  }

  /**
   * Delete a collection
   */
  async deleteCollection(collection: string): Promise<void> {
    if (!this.token) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${this.baseUrl}/collections/${collection}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (response.ok) {
        console.log(`✅ Collection "${collection}" deleted`);
      } else {
        const data = await response.json();
        throw new Error(data.errors?.[0]?.message || 'Failed to delete collection');
      }
    } catch (error) {
      console.error('❌ Error deleting collection:', error);
      throw error;
    }
  }

  /**
   * Create a competitions collection for DrawDay
   */
  async createCompetitionsCollection(): Promise<void> {
    const collection: DirectusCollection = {
      collection: 'competitions',
      meta: {
        singleton: false,
        icon: 'emoji_events',
        display_template: '{{name}} - {{status}}',
        accountability: 'all',
        color: '#6644FF',
      },
      schema: {
        name: 'competitions',
        comment: 'Competition entries for DrawDay raffles',
      },
    };

    await this.createCollection(collection);

    // Define fields
    const fields: DirectusField[] = [
      {
        field: 'id',
        type: 'uuid',
        meta: {
          hidden: true,
          readonly: true,
        },
        schema: {
          is_primary_key: true,
        },
      },
      {
        field: 'status',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Draft', value: 'draft' },
              { text: 'Active', value: 'active' },
              { text: 'Completed', value: 'completed' },
              { text: 'Archived', value: 'archived' },
            ],
          },
          width: 'half',
        },
        schema: {
          default_value: 'draft',
          is_nullable: false,
        },
      },
      {
        field: 'name',
        type: 'string',
        meta: {
          interface: 'input',
          required: true,
          width: 'half',
        },
        schema: {
          is_nullable: false,
        },
      },
      {
        field: 'description',
        type: 'text',
        meta: {
          interface: 'input-rich-text-html',
          width: 'full',
        },
      },
      {
        field: 'start_date',
        type: 'datetime',
        meta: {
          interface: 'datetime',
          width: 'half',
        },
      },
      {
        field: 'end_date',
        type: 'datetime',
        meta: {
          interface: 'datetime',
          width: 'half',
        },
      },
      {
        field: 'draw_date',
        type: 'datetime',
        meta: {
          interface: 'datetime',
          width: 'half',
        },
      },
      {
        field: 'total_entries',
        type: 'integer',
        meta: {
          interface: 'input',
          readonly: true,
          width: 'half',
        },
        schema: {
          default_value: 0,
        },
      },
      {
        field: 'prize_details',
        type: 'json',
        meta: {
          interface: 'input-code',
          options: {
            language: 'json',
          },
          width: 'full',
        },
      },
      {
        field: 'winner_details',
        type: 'json',
        meta: {
          interface: 'input-code',
          options: {
            language: 'json',
          },
          width: 'full',
        },
      },
      {
        field: 'created_by',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          readonly: true,
          hidden: true,
        },
      },
      {
        field: 'date_created',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          readonly: true,
          hidden: true,
        },
        schema: {
          default_value: 'CURRENT_TIMESTAMP',
        },
      },
      {
        field: 'date_updated',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          readonly: true,
          hidden: true,
        },
        schema: {
          default_value: 'CURRENT_TIMESTAMP',
        },
      },
    ];

    // Create each field
    for (const field of fields) {
      await this.createField('competitions', field);
    }

    console.log('✅ Competitions collection created with all fields');
  }
}

// Example usage
async function main() {
  const manager = new DirectusCollectionManager();
  
  try {
    // Authenticate
    await manager.authenticate(
      process.env.ADMIN_EMAIL || 'admin@drawday.app',
      process.env.ADMIN_PASSWORD || 'drawday'
    );

    // Get existing collections
    const collections = await manager.getCollections();
    console.log('\n📋 Existing Collections:');
    collections.forEach(c => console.log(`  - ${c.collection}`));

    // Create competitions collection (uncomment to run)
    // console.log('\n🎯 Creating Competitions Collection:');
    // await manager.createCompetitionsCollection();

    // Update a collection (uncomment to run)
    // await manager.updateCollection('competitions', {
    //   meta: {
    //     note: 'Manages all DrawDay competition entries and winners',
    //   },
    // });

    // Delete a collection (uncomment to run - BE CAREFUL!)
    // await manager.deleteCollection('test_collection');

  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { DirectusCollectionManager };