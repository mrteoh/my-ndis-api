--
-- PostgreSQL database dump
--

-- Dumped from database version 14.19 (Homebrew)
-- Dumped by pg_dump version 17.5

-- Started on 2025-09-06 17:23:33 +08

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: africk
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO africk;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 210 (class 1259 OID 16506)
-- Name: invoices; Type: TABLE; Schema: public; Owner: africk
--

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


ALTER TABLE public.invoices OWNER TO africk;

--
-- TOC entry 209 (class 1259 OID 16505)
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: africk
--

CREATE SEQUENCE public.invoices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO africk;

--
-- TOC entry 3784 (class 0 OID 0)
-- Dependencies: 209
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: africk
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- TOC entry 3635 (class 2604 OID 16509)
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: africk
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- TOC entry 3638 (class 2606 OID 16514)
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: africk
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 3783 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: africk
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2025-09-06 17:23:33 +08

--
-- PostgreSQL database dump complete
--

