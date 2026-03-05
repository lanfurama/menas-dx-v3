--
-- PostgreSQL database dump
--

\restrict WTWwXRx2anp6UwKvWA3s9uFLDDVUS2rrpH2g6H1uaS9Aa3fJylhvVA4qjTYjwUJ

-- Dumped from database version 18.3 (Homebrew)
-- Dumped by pg_dump version 18.0

-- Started on 2026-03-05 15:13:29 +07

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
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 4252 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 334 (class 1255 OID 16405)
-- Name: update_conversation_last_message(); Type: FUNCTION; Schema: public; Owner: bcmac
--

CREATE FUNCTION public.update_conversation_last_message() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE conversations 
    SET last_message_at = NEW.timestamp,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_conversation_last_message() OWNER TO bcmac;

--
-- TOC entry 335 (class 1255 OID 16406)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: bcmac
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO bcmac;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 305 (class 1259 OID 17632)
-- Name: activities; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.activities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_id uuid NOT NULL,
    date date NOT NULL,
    action character varying(255) NOT NULL,
    value character varying(255),
    type character varying(20),
    items text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT activities_type_check CHECK (((type)::text = ANY (ARRAY[('email'::character varying)::text, ('call'::character varying)::text, ('order'::character varying)::text, ('meeting'::character varying)::text, ('sms'::character varying)::text])))
);


ALTER TABLE public.activities OWNER TO bcmac;

--
-- TOC entry 306 (class 1259 OID 17644)
-- Name: api_connectors; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.api_connectors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    provider character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    status character varying(20) DEFAULT 'Connected'::character varying NOT NULL,
    last_sync timestamp with time zone,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT api_connectors_provider_check CHECK (((provider)::text = ANY (ARRAY[('Vihat'::character varying)::text, ('PBX'::character varying)::text, ('Webhook'::character varying)::text, ('Custom'::character varying)::text]))),
    CONSTRAINT api_connectors_status_check CHECK (((status)::text = ANY (ARRAY[('Connected'::character varying)::text, ('Disconnected'::character varying)::text, ('Pending'::character varying)::text])))
);


ALTER TABLE public.api_connectors OWNER TO bcmac;

--
-- TOC entry 307 (class 1259 OID 17661)
-- Name: api_endpoints; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.api_endpoints (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    connector_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    path character varying(500) NOT NULL,
    method character varying(10) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT api_endpoints_method_check CHECK (((method)::text = ANY (ARRAY[('GET'::character varying)::text, ('POST'::character varying)::text, ('PUT'::character varying)::text, ('DELETE'::character varying)::text, ('PATCH'::character varying)::text])))
);


ALTER TABLE public.api_endpoints OWNER TO bcmac;

--
-- TOC entry 308 (class 1259 OID 17675)
-- Name: api_logs; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.api_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    connector_id uuid,
    service character varying(255),
    action character varying(255),
    status character varying(20) NOT NULL,
    message text,
    request_data jsonb,
    response_data jsonb,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT api_logs_status_check CHECK (((status)::text = ANY (ARRAY[('Success'::character varying)::text, ('Error'::character varying)::text])))
);


ALTER TABLE public.api_logs OWNER TO bcmac;

--
-- TOC entry 309 (class 1259 OID 17685)
-- Name: campaigns; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.campaigns (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    status character varying(20) NOT NULL,
    objective character varying(50),
    spent numeric(15,2) DEFAULT 0,
    reach integer,
    cpc numeric(10,2),
    ctr numeric(5,2),
    channels text[],
    start_date date,
    end_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT campaigns_cpc_positive CHECK (((cpc IS NULL) OR (cpc >= (0)::numeric))),
    CONSTRAINT campaigns_ctr_valid CHECK (((ctr IS NULL) OR ((ctr >= (0)::numeric) AND (ctr <= (100)::numeric)))),
    CONSTRAINT campaigns_reach_positive CHECK (((reach IS NULL) OR (reach >= 0))),
    CONSTRAINT campaigns_spent_positive CHECK ((spent >= (0)::numeric)),
    CONSTRAINT campaigns_status_check CHECK (((status)::text = ANY (ARRAY[('Active'::character varying)::text, ('Paused'::character varying)::text, ('Completed'::character varying)::text])))
);


ALTER TABLE public.campaigns OWNER TO bcmac;

--
-- TOC entry 310 (class 1259 OID 17702)
-- Name: channels; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.channels (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type character varying(20) NOT NULL,
    internal_name character varying(255) NOT NULL,
    provider_id character varying(255),
    token text,
    status character varying(20) DEFAULT 'Connected'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT channels_status_check CHECK (((status)::text = ANY (ARRAY[('Connected'::character varying)::text, ('Error'::character varying)::text, ('Pending'::character varying)::text]))),
    CONSTRAINT channels_type_check CHECK (((type)::text = ANY (ARRAY[('ZALO'::character varying)::text, ('MESSENGER'::character varying)::text, ('VIBER'::character varying)::text, ('EMAIL'::character varying)::text, ('WEBCHAT'::character varying)::text, ('SMS'::character varying)::text, ('VOICE'::character varying)::text])))
);


ALTER TABLE public.channels OWNER TO bcmac;

--
-- TOC entry 311 (class 1259 OID 17717)
-- Name: conversations; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.conversations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_id uuid NOT NULL,
    customer_name character varying(255) NOT NULL,
    channel character varying(20) NOT NULL,
    channel_source character varying(255),
    status character varying(20) DEFAULT 'Open'::character varying NOT NULL,
    assignee_id uuid,
    assignee_name character varying(255),
    unread_count integer DEFAULT 0,
    tags text[],
    email character varying(255),
    phone character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_message_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT conversations_channel_check CHECK (((channel)::text = ANY (ARRAY[('ZALO'::character varying)::text, ('MESSENGER'::character varying)::text, ('VIBER'::character varying)::text, ('EMAIL'::character varying)::text, ('WEBCHAT'::character varying)::text, ('SMS'::character varying)::text, ('VOICE'::character varying)::text]))),
    CONSTRAINT conversations_status_check CHECK (((status)::text = ANY (ARRAY[('Open'::character varying)::text, ('Pending'::character varying)::text, ('Resolved'::character varying)::text]))),
    CONSTRAINT conversations_unread_positive CHECK ((unread_count >= 0))
);


ALTER TABLE public.conversations OWNER TO bcmac;

--
-- TOC entry 312 (class 1259 OID 17736)
-- Name: customers; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.customers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255),
    email character varying(255),
    phone character varying(50),
    avatar_url text,
    status character varying(20) DEFAULT 'Active'::character varying NOT NULL,
    channel character varying(20),
    sentiment character varying(20),
    source character varying(100),
    crm_id character varying(100),
    last_sync timestamp with time zone,
    job_title character varying(255),
    company character varying(255),
    birthday date,
    address text,
    segment character varying(50) NOT NULL,
    brand character varying(100),
    loyalty_tier character varying(20) DEFAULT 'Silver'::character varying,
    loyalty_points integer DEFAULT 0,
    preferences text[],
    last_contact text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "MaTheKHTT" text,
    CONSTRAINT customers_brand_check CHECK (((brand)::text = ANY (ARRAY[('V-Sense'::character varying)::text, ('Steakhouse The Fan'::character varying)::text, ('Don Cipriani''s'::character varying)::text, ('Thai Restaurant'::character varying)::text, ('Others'::character varying)::text, ('N/A'::character varying)::text]))),
    CONSTRAINT customers_channel_check CHECK (((channel)::text = ANY (ARRAY[('ZALO'::character varying)::text, ('MESSENGER'::character varying)::text, ('VIBER'::character varying)::text, ('EMAIL'::character varying)::text, ('WEBCHAT'::character varying)::text, ('SMS'::character varying)::text, ('VOICE'::character varying)::text]))),
    CONSTRAINT customers_loyalty_points_positive CHECK ((loyalty_points >= 0)),
    CONSTRAINT customers_loyalty_tier_check CHECK (((loyalty_tier)::text = ANY (ARRAY[('Silver'::character varying)::text, ('Gold'::character varying)::text, ('Platinum'::character varying)::text, ('Diamond'::character varying)::text]))),
    CONSTRAINT customers_must_have_contact CHECK (((email IS NOT NULL) OR (phone IS NOT NULL))),
    CONSTRAINT customers_segment_check CHECK (((segment)::text = ANY (ARRAY[('F&B'::character varying)::text, ('Gourmet Market'::character varying)::text, ('Retail'::character varying)::text, ('MenaWorld'::character varying)::text, ('Others'::character varying)::text, ('VIP'::character varying)::text]))),
    CONSTRAINT customers_sentiment_check CHECK (((sentiment)::text = ANY (ARRAY[('Positive'::character varying)::text, ('Neutral'::character varying)::text, ('Negative'::character varying)::text]))),
    CONSTRAINT customers_status_check CHECK (((status)::text = ANY (ARRAY[('Active'::character varying)::text, ('Lead'::character varying)::text, ('Inactive'::character varying)::text])))
);


ALTER TABLE public.customers OWNER TO bcmac;

--
-- TOC entry 313 (class 1259 OID 17758)
-- Name: datamart_customer; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.datamart_customer (
    "MaTheKHTT" character varying(50),
    name character varying(255),
    email character varying(255),
    phone character varying(50),
    loyalty_tier character varying(100),
    status character varying(50),
    "MaHD" character varying(50),
    "NgayHD" timestamp without time zone,
    "ThanhTienBan" numeric(18,2),
    store_name character varying(255)
);


ALTER TABLE public.datamart_customer OWNER TO bcmac;

--
-- TOC entry 314 (class 1259 OID 17763)
-- Name: datamart_location; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.datamart_location (
    item_number character varying(50),
    barcode character varying(50),
    item_name character varying(255),
    location_code character varying(50),
    location_name character varying(255),
    localtion_adress character varying(255),
    quantity numeric(18,2),
    unit character varying(50)
);


ALTER TABLE public.datamart_location OWNER TO bcmac;

--
-- TOC entry 315 (class 1259 OID 17768)
-- Name: datamart_transaction; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.datamart_transaction (
    "MaTheKHTT" character varying(50),
    "HoaDonID" character varying(50),
    "MaHD" character varying(50),
    "MaHH" character varying(50),
    "TenHH" character varying(255),
    category_name character varying(255),
    "NgayGioQuet" timestamp without time zone,
    "MaCH" character varying(50),
    store_name character varying(255),
    "TenQuay" character varying(100),
    "TenKho" character varying(100),
    "STT" integer,
    "SoLuong" numeric(18,2),
    "DGBan" numeric(18,2),
    "TriGiaBan" numeric(18,2),
    "TLCKGiamGia" numeric(18,2),
    "TienGiamGia" numeric(18,2),
    "ThanhTienBan" numeric(18,2),
    "VATDauRa" numeric(18,2),
    "TriGiaVATDauRa" numeric(18,2)
);


ALTER TABLE public.datamart_transaction OWNER TO bcmac;

--
-- TOC entry 316 (class 1259 OID 17773)
-- Name: deals; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.deals (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    stage character varying(50) NOT NULL,
    amount numeric(15,2) NOT NULL,
    close_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT deals_amount_positive CHECK ((amount >= (0)::numeric)),
    CONSTRAINT deals_stage_check CHECK (((stage)::text = ANY (ARRAY[('Qualification'::character varying)::text, ('Proposal'::character varying)::text, ('Negotiation'::character varying)::text, ('Closed Won'::character varying)::text])))
);


ALTER TABLE public.deals OWNER TO bcmac;

--
-- TOC entry 317 (class 1259 OID 17786)
-- Name: messages; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.messages (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    conversation_id uuid NOT NULL,
    sender_id character varying(100) NOT NULL,
    text text NOT NULL,
    translated_text text,
    is_from_agent boolean DEFAULT false NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.messages OWNER TO bcmac;

--
-- TOC entry 318 (class 1259 OID 17800)
-- Name: related_contacts; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.related_contacts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    relation character varying(100),
    phone character varying(50),
    email character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.related_contacts OWNER TO bcmac;

--
-- TOC entry 319 (class 1259 OID 17810)
-- Name: settings; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    type character varying(20) DEFAULT 'string'::character varying,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT settings_type_check CHECK (((type)::text = ANY (ARRAY[('string'::character varying)::text, ('number'::character varying)::text, ('boolean'::character varying)::text, ('json'::character varying)::text])))
);


ALTER TABLE public.settings OWNER TO bcmac;

--
-- TOC entry 320 (class 1259 OID 17822)
-- Name: special_occasions; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.special_occasions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    date character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.special_occasions OWNER TO bcmac;

--
-- TOC entry 321 (class 1259 OID 17831)
-- Name: tasks; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.tasks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    conversation_id uuid,
    customer_id uuid,
    title character varying(500) NOT NULL,
    description text,
    due_date character varying(50),
    completed boolean DEFAULT false,
    assigned_to uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tasks_must_have_reference CHECK (((conversation_id IS NOT NULL) OR (customer_id IS NOT NULL)))
);


ALTER TABLE public.tasks OWNER TO bcmac;

--
-- TOC entry 322 (class 1259 OID 17843)
-- Name: team_member_metrics; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.team_member_metrics (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    member_id uuid NOT NULL,
    date date NOT NULL,
    tickets_resolved integer DEFAULT 0,
    avg_response_time_seconds integer,
    csat_score numeric(3,2),
    active_chats integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT metrics_active_chats_positive CHECK ((active_chats >= 0)),
    CONSTRAINT metrics_csat_valid CHECK (((csat_score IS NULL) OR ((csat_score >= (0)::numeric) AND (csat_score <= (5)::numeric)))),
    CONSTRAINT metrics_response_time_positive CHECK (((avg_response_time_seconds IS NULL) OR (avg_response_time_seconds >= 0))),
    CONSTRAINT metrics_tickets_positive CHECK ((tickets_resolved >= 0))
);


ALTER TABLE public.team_member_metrics OWNER TO bcmac;

--
-- TOC entry 323 (class 1259 OID 17857)
-- Name: team_members; Type: TABLE; Schema: public; Owner: bcmac
--

CREATE TABLE public.team_members (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(50),
    password_hash character varying(255),
    role character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'Active'::character varying NOT NULL,
    department character varying(100),
    avatar_url text,
    joined_date date DEFAULT CURRENT_DATE NOT NULL,
    skills text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT team_members_role_check CHECK (((role)::text = ANY (ARRAY[('Admin'::character varying)::text, ('Manager'::character varying)::text, ('Agent'::character varying)::text]))),
    CONSTRAINT team_members_status_check CHECK (((status)::text = ANY (ARRAY[('Active'::character varying)::text, ('Inactive'::character varying)::text, ('Away'::character varying)::text])))
);


ALTER TABLE public.team_members OWNER TO bcmac;

--
-- TOC entry 3987 (class 2606 OID 93372)
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- TOC entry 3992 (class 2606 OID 93374)
-- Name: api_connectors api_connectors_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.api_connectors
    ADD CONSTRAINT api_connectors_pkey PRIMARY KEY (id);


--
-- TOC entry 3997 (class 2606 OID 93376)
-- Name: api_endpoints api_endpoints_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.api_endpoints
    ADD CONSTRAINT api_endpoints_pkey PRIMARY KEY (id);


--
-- TOC entry 4001 (class 2606 OID 93378)
-- Name: api_logs api_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.api_logs
    ADD CONSTRAINT api_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4006 (class 2606 OID 93380)
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- TOC entry 4012 (class 2606 OID 93382)
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (id);


--
-- TOC entry 4014 (class 2606 OID 93384)
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- TOC entry 4024 (class 2606 OID 93386)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4035 (class 2606 OID 93388)
-- Name: deals deals_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_pkey PRIMARY KEY (id);


--
-- TOC entry 4045 (class 2606 OID 93390)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4047 (class 2606 OID 93392)
-- Name: related_contacts related_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.related_contacts
    ADD CONSTRAINT related_contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 4049 (class 2606 OID 93394)
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- TOC entry 4051 (class 2606 OID 93396)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4053 (class 2606 OID 93398)
-- Name: special_occasions special_occasions_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.special_occasions
    ADD CONSTRAINT special_occasions_pkey PRIMARY KEY (id);


--
-- TOC entry 4061 (class 2606 OID 93400)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4065 (class 2606 OID 93402)
-- Name: team_member_metrics team_member_metrics_member_id_date_key; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.team_member_metrics
    ADD CONSTRAINT team_member_metrics_member_id_date_key UNIQUE (member_id, date);


--
-- TOC entry 4067 (class 2606 OID 93404)
-- Name: team_member_metrics team_member_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.team_member_metrics
    ADD CONSTRAINT team_member_metrics_pkey PRIMARY KEY (id);


--
-- TOC entry 4073 (class 2606 OID 93406)
-- Name: team_members team_members_email_key; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_email_key UNIQUE (email);


--
-- TOC entry 4075 (class 2606 OID 93408)
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- TOC entry 3988 (class 1259 OID 93549)
-- Name: idx_activities_customer_date; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_activities_customer_date ON public.activities USING btree (customer_id, date DESC);


--
-- TOC entry 3989 (class 1259 OID 93550)
-- Name: idx_activities_customer_id; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_activities_customer_id ON public.activities USING btree (customer_id);


--
-- TOC entry 3990 (class 1259 OID 93551)
-- Name: idx_activities_date; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_activities_date ON public.activities USING btree (date DESC);


--
-- TOC entry 3993 (class 1259 OID 93552)
-- Name: idx_api_connectors_name; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_api_connectors_name ON public.api_connectors USING btree (name);


--
-- TOC entry 3994 (class 1259 OID 93553)
-- Name: idx_api_connectors_provider; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_api_connectors_provider ON public.api_connectors USING btree (provider);


--
-- TOC entry 3995 (class 1259 OID 93554)
-- Name: idx_api_connectors_status; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_api_connectors_status ON public.api_connectors USING btree (status);


--
-- TOC entry 3998 (class 1259 OID 93555)
-- Name: idx_api_endpoints_connector_id; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_api_endpoints_connector_id ON public.api_endpoints USING btree (connector_id);


--
-- TOC entry 3999 (class 1259 OID 93556)
-- Name: idx_api_endpoints_method; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_api_endpoints_method ON public.api_endpoints USING btree (method);


--
-- TOC entry 4002 (class 1259 OID 93557)
-- Name: idx_api_logs_connector_id; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_api_logs_connector_id ON public.api_logs USING btree (connector_id);


--
-- TOC entry 4003 (class 1259 OID 93558)
-- Name: idx_api_logs_status; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_api_logs_status ON public.api_logs USING btree (status);


--
-- TOC entry 4004 (class 1259 OID 93559)
-- Name: idx_api_logs_timestamp; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_api_logs_timestamp ON public.api_logs USING btree ("timestamp" DESC);


--
-- TOC entry 4007 (class 1259 OID 93560)
-- Name: idx_campaigns_end_date; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_campaigns_end_date ON public.campaigns USING btree (end_date);


--
-- TOC entry 4008 (class 1259 OID 93561)
-- Name: idx_campaigns_name; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_campaigns_name ON public.campaigns USING btree (name);


--
-- TOC entry 4009 (class 1259 OID 93562)
-- Name: idx_campaigns_start_date; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_campaigns_start_date ON public.campaigns USING btree (start_date);


--
-- TOC entry 4010 (class 1259 OID 93563)
-- Name: idx_campaigns_status; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_campaigns_status ON public.campaigns USING btree (status);


--
-- TOC entry 4015 (class 1259 OID 93564)
-- Name: idx_conversations_assignee_id; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_conversations_assignee_id ON public.conversations USING btree (assignee_id);


--
-- TOC entry 4016 (class 1259 OID 93565)
-- Name: idx_conversations_channel; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_conversations_channel ON public.conversations USING btree (channel);


--
-- TOC entry 4017 (class 1259 OID 93566)
-- Name: idx_conversations_created_at; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_conversations_created_at ON public.conversations USING btree (created_at DESC);


--
-- TOC entry 4018 (class 1259 OID 93567)
-- Name: idx_conversations_customer_id; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_conversations_customer_id ON public.conversations USING btree (customer_id);


--
-- TOC entry 4019 (class 1259 OID 93568)
-- Name: idx_conversations_customer_name; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_conversations_customer_name ON public.conversations USING btree (customer_name);


--
-- TOC entry 4020 (class 1259 OID 93569)
-- Name: idx_conversations_last_message_at; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_conversations_last_message_at ON public.conversations USING btree (last_message_at DESC);


--
-- TOC entry 4021 (class 1259 OID 93570)
-- Name: idx_conversations_status; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_conversations_status ON public.conversations USING btree (status);


--
-- TOC entry 4022 (class 1259 OID 93571)
-- Name: idx_conversations_tags; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_conversations_tags ON public.conversations USING gin (tags);


--
-- TOC entry 4025 (class 1259 OID 93572)
-- Name: idx_customers_brand; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_customers_brand ON public.customers USING btree (brand);


--
-- TOC entry 4026 (class 1259 OID 93573)
-- Name: idx_customers_channel; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_customers_channel ON public.customers USING btree (channel);


--
-- TOC entry 4027 (class 1259 OID 93574)
-- Name: idx_customers_created_at; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_customers_created_at ON public.customers USING btree (created_at);


--
-- TOC entry 4028 (class 1259 OID 93575)
-- Name: idx_customers_email; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_customers_email ON public.customers USING btree (email);


--
-- TOC entry 4029 (class 1259 OID 93576)
-- Name: idx_customers_loyalty_tier; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_customers_loyalty_tier ON public.customers USING btree (loyalty_tier);


--
-- TOC entry 4030 (class 1259 OID 93577)
-- Name: idx_customers_name; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_customers_name ON public.customers USING btree (name);


--
-- TOC entry 4031 (class 1259 OID 93578)
-- Name: idx_customers_phone; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_customers_phone ON public.customers USING btree (phone);


--
-- TOC entry 4032 (class 1259 OID 93579)
-- Name: idx_customers_segment; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_customers_segment ON public.customers USING btree (segment);


--
-- TOC entry 4033 (class 1259 OID 93580)
-- Name: idx_customers_status; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_customers_status ON public.customers USING btree (status);


--
-- TOC entry 4036 (class 1259 OID 93581)
-- Name: idx_deals_close_date; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_deals_close_date ON public.deals USING btree (close_date);


--
-- TOC entry 4037 (class 1259 OID 93582)
-- Name: idx_deals_customer_id; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_deals_customer_id ON public.deals USING btree (customer_id);


--
-- TOC entry 4038 (class 1259 OID 93583)
-- Name: idx_deals_customer_stage; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_deals_customer_stage ON public.deals USING btree (customer_id, stage);


--
-- TOC entry 4039 (class 1259 OID 93584)
-- Name: idx_deals_stage; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_deals_stage ON public.deals USING btree (stage);


--
-- TOC entry 4040 (class 1259 OID 93585)
-- Name: idx_messages_conversation_id; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);


--
-- TOC entry 4041 (class 1259 OID 93586)
-- Name: idx_messages_conversation_timestamp; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_messages_conversation_timestamp ON public.messages USING btree (conversation_id, "timestamp" DESC);


--
-- TOC entry 4042 (class 1259 OID 93587)
-- Name: idx_messages_sender_id; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_messages_sender_id ON public.messages USING btree (sender_id);


--
-- TOC entry 4043 (class 1259 OID 93588)
-- Name: idx_messages_timestamp; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_messages_timestamp ON public.messages USING btree ("timestamp" DESC);


--
-- TOC entry 4054 (class 1259 OID 93589)
-- Name: idx_tasks_assigned_to; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_tasks_assigned_to ON public.tasks USING btree (assigned_to);


--
-- TOC entry 4055 (class 1259 OID 93590)
-- Name: idx_tasks_completed; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_tasks_completed ON public.tasks USING btree (completed);


--
-- TOC entry 4056 (class 1259 OID 93591)
-- Name: idx_tasks_conversation_completed; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_tasks_conversation_completed ON public.tasks USING btree (conversation_id, completed);


--
-- TOC entry 4057 (class 1259 OID 93592)
-- Name: idx_tasks_conversation_id; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_tasks_conversation_id ON public.tasks USING btree (conversation_id);


--
-- TOC entry 4058 (class 1259 OID 93593)
-- Name: idx_tasks_customer_completed; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_tasks_customer_completed ON public.tasks USING btree (customer_id, completed);


--
-- TOC entry 4059 (class 1259 OID 93594)
-- Name: idx_tasks_customer_id; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_tasks_customer_id ON public.tasks USING btree (customer_id);


--
-- TOC entry 4062 (class 1259 OID 93595)
-- Name: idx_team_member_metrics_date; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_team_member_metrics_date ON public.team_member_metrics USING btree (date DESC);


--
-- TOC entry 4063 (class 1259 OID 93596)
-- Name: idx_team_member_metrics_member_id; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_team_member_metrics_member_id ON public.team_member_metrics USING btree (member_id);


--
-- TOC entry 4068 (class 1259 OID 93597)
-- Name: idx_team_members_department; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_team_members_department ON public.team_members USING btree (department);


--
-- TOC entry 4069 (class 1259 OID 93598)
-- Name: idx_team_members_email; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_team_members_email ON public.team_members USING btree (email);


--
-- TOC entry 4070 (class 1259 OID 93599)
-- Name: idx_team_members_role; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_team_members_role ON public.team_members USING btree (role);


--
-- TOC entry 4071 (class 1259 OID 93600)
-- Name: idx_team_members_status; Type: INDEX; Schema: public; Owner: bcmac
--

CREATE INDEX idx_team_members_status ON public.team_members USING btree (status);


--
-- TOC entry 4089 (class 2620 OID 93601)
-- Name: api_connectors update_api_connectors_updated_at; Type: TRIGGER; Schema: public; Owner: bcmac
--

CREATE TRIGGER update_api_connectors_updated_at BEFORE UPDATE ON public.api_connectors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4090 (class 2620 OID 93602)
-- Name: api_endpoints update_api_endpoints_updated_at; Type: TRIGGER; Schema: public; Owner: bcmac
--

CREATE TRIGGER update_api_endpoints_updated_at BEFORE UPDATE ON public.api_endpoints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4091 (class 2620 OID 93603)
-- Name: campaigns update_campaigns_updated_at; Type: TRIGGER; Schema: public; Owner: bcmac
--

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4092 (class 2620 OID 93604)
-- Name: channels update_channels_updated_at; Type: TRIGGER; Schema: public; Owner: bcmac
--

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4096 (class 2620 OID 93605)
-- Name: messages update_conversation_on_message; Type: TRIGGER; Schema: public; Owner: bcmac
--

CREATE TRIGGER update_conversation_on_message AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();


--
-- TOC entry 4093 (class 2620 OID 93606)
-- Name: conversations update_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: bcmac
--

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4094 (class 2620 OID 93607)
-- Name: customers update_customers_updated_at; Type: TRIGGER; Schema: public; Owner: bcmac
--

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4095 (class 2620 OID 93608)
-- Name: deals update_deals_updated_at; Type: TRIGGER; Schema: public; Owner: bcmac
--

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4097 (class 2620 OID 93609)
-- Name: settings update_settings_updated_at; Type: TRIGGER; Schema: public; Owner: bcmac
--

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4098 (class 2620 OID 93610)
-- Name: tasks update_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: bcmac
--

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4099 (class 2620 OID 93611)
-- Name: team_members update_team_members_updated_at; Type: TRIGGER; Schema: public; Owner: bcmac
--

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 4076 (class 2606 OID 93692)
-- Name: activities activities_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- TOC entry 4077 (class 2606 OID 93697)
-- Name: api_endpoints api_endpoints_connector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.api_endpoints
    ADD CONSTRAINT api_endpoints_connector_id_fkey FOREIGN KEY (connector_id) REFERENCES public.api_connectors(id) ON DELETE CASCADE;


--
-- TOC entry 4078 (class 2606 OID 93702)
-- Name: api_logs api_logs_connector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.api_logs
    ADD CONSTRAINT api_logs_connector_id_fkey FOREIGN KEY (connector_id) REFERENCES public.api_connectors(id) ON DELETE SET NULL;


--
-- TOC entry 4079 (class 2606 OID 93707)
-- Name: conversations conversations_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.team_members(id) ON DELETE SET NULL;


--
-- TOC entry 4080 (class 2606 OID 93712)
-- Name: conversations conversations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- TOC entry 4081 (class 2606 OID 93717)
-- Name: deals deals_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.deals
    ADD CONSTRAINT deals_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- TOC entry 4082 (class 2606 OID 93722)
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- TOC entry 4083 (class 2606 OID 93727)
-- Name: related_contacts related_contacts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.related_contacts
    ADD CONSTRAINT related_contacts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- TOC entry 4084 (class 2606 OID 93732)
-- Name: special_occasions special_occasions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.special_occasions
    ADD CONSTRAINT special_occasions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- TOC entry 4085 (class 2606 OID 93737)
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.team_members(id) ON DELETE SET NULL;


--
-- TOC entry 4086 (class 2606 OID 93742)
-- Name: tasks tasks_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- TOC entry 4087 (class 2606 OID 93747)
-- Name: tasks tasks_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- TOC entry 4088 (class 2606 OID 93752)
-- Name: team_member_metrics team_member_metrics_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bcmac
--

ALTER TABLE ONLY public.team_member_metrics
    ADD CONSTRAINT team_member_metrics_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.team_members(id) ON DELETE CASCADE;


-- Completed on 2026-03-05 15:13:29 +07

--
-- PostgreSQL database dump complete
--

\unrestrict WTWwXRx2anp6UwKvWA3s9uFLDDVUS2rrpH2g6H1uaS9Aa3fJylhvVA4qjTYjwUJ

