# My NDIS API

A RESTful API for managing NDIS (National Disability Insurance Scheme) data.

## Features

- CRUD operations for participants, providers, and plans
- Authentication and authorization
- API documentation with Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm

### Installation

```bash
git clone https://github.com/mrteoh/my-ndis-api.git
cd my-ndis-api
npm install
```

### Running the API

```bash
npm start
```

The API will be available at `http://localhost:4000`.

### POSTGRESQL

-- Create Database
CREATE DATABASE my_ndis_db;

-- Create Table
Create a tabse 'invoices'

CREATE TABLE public.invoices (
    id integer NOT NULL,
    support_item_number character varying(50),
    support_item_name text,
    registration_group_number integer,
    registration_group_name text,
    support_category_number integer,
    support_category_number_pace integer,
    support_category_name text,
    support_category_name_pace text,
    unit character varying(10),
    quote character varying(10),
    start_date date,
    end_date date,
    act numeric(10,2),
    nsw numeric(10,2),
    nt numeric(10,2),
    qld numeric(10,2),
    sa numeric(10,2),
    tas numeric(10,2),
    vic numeric(10,2),
    wa numeric(10,2),
    remote numeric(10,2),
    very_remote numeric(10,2),
    non_face_to_face_support_provision character varying(5),
    provider_travel character varying(5),
    short_notice_cancellations character varying(5),
    ndia_requested_reports character varying(5),
    irregular_sil_supports character varying(5),
    type text,
    invoice_date date,
    invoice_amount numeric(12,2),
    invoice_rate numeric(12,2),
    invoice_number character varying(100),
    max_rate numeric(12,2),
    created_at timestamp with time zone DEFAULT now()
);

