create database initial default charset 'utf8';
create user john identified with mysql_native_password by 'walker';
grant all on initial.* to john;

use initial;
create table member(
	code         integer unique not null auto_increment,
	email        character varying(200) unique not null,
	password     character varying(200) not null,
	first_name   character varying(200) not null,
	last_name    character varying(200) not null,
	photo        character varying(200)
);
alter table member add primary key(code);

create table post(
	code         integer unique not null auto_increment,
	topic        character varying(200) not null,
	detail       character varying(2000),
	owner        integer,
	time         timestamp
);
alter table post add primary key(code);
alter table post add foreign key(owner) references member(code);

create table photo(
	code         integer unique not null auto_increment,
	post         integer not null,
	file         character varying(2000) not null
);
alter table photo add primary key(code);
alter table photo add foreign key(post) references post(code);
