drop database if exists amber;
create database amber;

drop user if exists auser;
create user auser with password 'test';

grant all privileges on database amber to auser;

\c amber;
set role auser;

/* Tiendas */
drop table if exists dependencias cascade;
create table dependencias (
    id serial primary key,
    nombre text,
    direccion_calle text,
    direccion_numero_int text,
    direccion_numero_ext text,
    direccion_colonia text,
    direccion_localidad text,
    direccion_municipio text,
    direccion_ciudad text,
    direccion_estado text,
    direccion_pais text
);

/* Usuarios */
drop table if exists usuarios cascade;
create table usuarios(
    id serial primary key,
    usuario text,
    contrasena text,
    email text,
    nombres text,
    apellido_paterno text,
    apellido_materno text,
    rfc text,
    direccion_calle text,
    direccion_numero_int text,
    direccion_numero_ext text,
    direccion_colonia text,
    direccion_localidad text,
    direccion_municipio text,
    direccion_ciudad text,
    direccion_estado text,
    direccion_pais text,
    permiso_alerta boolean,
    permiso_administrador boolean,
    id_dependencia integer references dependencias(id)
);

insert into usuarios ("usuario","contrasena","nombres","apellido_paterno","apellido_materno","permiso_alerta","permiso_administrador") values
('admin','$2a$10$DmxbjTLBYDdcha8qlXpsaOyUqkJ0BAQ3Q4EIyMtr5HLXm6R0gSvbm','Administrador','','', true, true);
