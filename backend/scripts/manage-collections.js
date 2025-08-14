#!/usr/bin/env node

/**
 * Directus API Collection Management Script
 * 
 * This script demonstrates how to create, update, and manage collections
 * via the Directus API.
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://admin.drawday.app';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@drawday.app';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'drawday';

// Example: Authentication and token management
async function authenticate() {
  try {
    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });

    const data = await response.json();
    if (data.data?.access_token) {
      console.log('✅ Authentication successful');
      return data.data.access_token;
    } else {
      throw new Error('Authentication failed');
    }
  } catch (error) {
    console.error('❌ Authentication error:', error);
    throw error;
  }
}

// Create a new collection
async function createCollection(token, collectionData) {
  try {
    const response = await fetch(`${DIRECTUS_URL}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(collectionData),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Collection created successfully:', data.data.collection);
      return data.data;
    } else {
      throw new Error(data.errors?.[0]?.message || 'Failed to create collection');
    }
  } catch (error) {
    console.error('❌ Error creating collection:', error);
    throw error;
  }
}

// Create fields for a collection
async function createField(token, collection, fieldData) {
  try {
    const response = await fetch(`${DIRECTUS_URL}/fields/${collection}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(fieldData),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ Field "${fieldData.field}" created in collection "${collection}"`);
      return data.data;
    } else {
      throw new Error(data.errors?.[0]?.message || 'Failed to create field');
    }
  } catch (error) {
    console.error('❌ Error creating field:', error);
    throw error;
  }
}

// Update a collection
async function updateCollection(token, collection, updates) {
  try {
    const response = await fetch(`${DIRECTUS_URL}/collections/${collection}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ Collection "${collection}" updated successfully`);
      return data.data;
    } else {
      throw new Error(data.errors?.[0]?.message || 'Failed to update collection');
    }
  } catch (error) {
    console.error('❌ Error updating collection:', error);
    throw error;
  }
}

// Get all collections
async function getCollections(token) {
  try {
    const response = await fetch(`${DIRECTUS_URL}/collections`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      console.log('✅ Retrieved collections:', data.data.map(c => c.collection).join(', '));
      return data.data;
    } else {
      throw new Error('Failed to get collections');
    }
  } catch (error) {
    console.error('❌ Error getting collections:', error);
    throw error;
  }
}

// Delete a collection
async function deleteCollection(token, collection) {
  try {
    const response = await fetch(`${DIRECTUS_URL}/collections/${collection}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log(`✅ Collection "${collection}" deleted successfully`);
      return true;
    } else {
      const data = await response.json();
      throw new Error(data.errors?.[0]?.message || 'Failed to delete collection');
    }
  } catch (error) {
    console.error('❌ Error deleting collection:', error);
    throw error;
  }
}

// Example: Create a blog posts collection
async function createBlogPostsCollection(token) {
  // Create the collection
  const collectionData = {
    collection: 'blog_posts',
    meta: {
      singleton: false,
      icon: 'article',
      display_template: '{{title}}',
      translations: [
        {
          language: 'en-US',
          translation: 'Blog Posts',
          singular: 'Blog Post',
          plural: 'Blog Posts',
        },
      ],
    },
    schema: {
      name: 'blog_posts',
      comment: 'Blog posts for the website',
    },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
        },
        schema: {
          is_primary_key: true,
          has_auto_increment: false,
        },
      },
    ],
  };

  await createCollection(token, collectionData);

  // Add fields to the collection
  const fields = [
    {
      field: 'status',
      type: 'string',
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Draft', value: 'draft' },
            { text: 'Published', value: 'published' },
            { text: 'Archived', value: 'archived' },
          ],
        },
        display: 'labels',
        width: 'half',
      },
      schema: {
        default_value: 'draft',
        is_nullable: false,
      },
    },
    {
      field: 'sort',
      type: 'integer',
      meta: {
        interface: 'input',
        hidden: true,
      },
      schema: {},
    },
    {
      field: 'date_created',
      type: 'timestamp',
      meta: {
        interface: 'datetime',
        readonly: true,
        hidden: true,
        width: 'half',
        display: 'datetime',
        display_options: {
          relative: true,
        },
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
        width: 'half',
        display: 'datetime',
        display_options: {
          relative: true,
        },
      },
      schema: {
        default_value: 'CURRENT_TIMESTAMP',
      },
    },
    {
      field: 'title',
      type: 'string',
      meta: {
        interface: 'input',
        options: {
          placeholder: 'Enter the blog post title',
        },
        required: true,
        width: 'full',
      },
      schema: {
        is_nullable: false,
      },
    },
    {
      field: 'slug',
      type: 'string',
      meta: {
        interface: 'input',
        options: {
          placeholder: 'blog-post-url-slug',
        },
        required: true,
        width: 'half',
      },
      schema: {
        is_nullable: false,
        is_unique: true,
      },
    },
    {
      field: 'author',
      type: 'string',
      meta: {
        interface: 'input',
        width: 'half',
      },
      schema: {},
    },
    {
      field: 'excerpt',
      type: 'text',
      meta: {
        interface: 'input-multiline',
        options: {
          placeholder: 'Brief description of the blog post',
        },
        width: 'full',
      },
      schema: {},
    },
    {
      field: 'content',
      type: 'text',
      meta: {
        interface: 'input-rich-text-html',
        options: {
          toolbar: [
            'bold',
            'italic',
            'underline',
            'strikethrough',
            'subscript',
            'superscript',
            'fontselect',
            'fontsizeselect',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'quote',
            'bulletlist',
            'numberlist',
            'alignleft',
            'aligncenter',
            'alignright',
            'alignjustify',
            'alignnone',
            'outdent',
            'indent',
            'remove',
            'cut',
            'copy',
            'paste',
            'pastetext',
            'hr',
            'undo',
            'redo',
            'link',
            'unlink',
            'image',
            'media',
            'table',
            'code',
            'fullscreen',
            'visualblocks',
          ],
        },
        width: 'full',
      },
      schema: {},
    },
    {
      field: 'featured_image',
      type: 'uuid',
      meta: {
        interface: 'file-image',
        display: 'image',
        width: 'full',
      },
      schema: {},
    },
    {
      field: 'tags',
      type: 'json',
      meta: {
        interface: 'tags',
        options: {
          placeholder: 'Add tags...',
        },
        width: 'full',
      },
      schema: {},
    },
    {
      field: 'published_date',
      type: 'date',
      meta: {
        interface: 'datetime',
        width: 'half',
      },
      schema: {},
    },
    {
      field: 'seo_title',
      type: 'string',
      meta: {
        interface: 'input',
        options: {
          placeholder: 'SEO optimized title',
        },
        width: 'half',
        group: 'seo',
      },
      schema: {},
    },
    {
      field: 'seo_description',
      type: 'text',
      meta: {
        interface: 'input-multiline',
        options: {
          placeholder: 'SEO meta description',
        },
        width: 'full',
        group: 'seo',
      },
      schema: {},
    },
  ];

  // Create each field
  for (const field of fields) {
    await createField(token, 'blog_posts', field);
  }

  console.log('✅ Blog posts collection created with all fields');
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Directus Collection Management\n');
    console.log(`📍 Directus URL: ${DIRECTUS_URL}\n`);

    // Authenticate
    const token = await authenticate();

    // Get existing collections
    console.log('\n📋 Existing Collections:');
    await getCollections(token);

    // Example: Create a blog posts collection
    // Uncomment to create the collection
    // console.log('\n📝 Creating Blog Posts Collection:');
    // await createBlogPostsCollection(token);

    // Example: Update a collection
    // console.log('\n✏️ Updating Collection:');
    // await updateCollection(token, 'blog_posts', {
    //   meta: {
    //     note: 'Updated collection for blog posts with rich content',
    //   },
    // });

    // Example: Delete a collection (BE CAREFUL!)
    // console.log('\n🗑️ Deleting Collection:');
    // await deleteCollection(token, 'test_collection');

    console.log('\n✨ Done!');
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  authenticate,
  createCollection,
  createField,
  updateCollection,
  getCollections,
  deleteCollection,
  createBlogPostsCollection,
};