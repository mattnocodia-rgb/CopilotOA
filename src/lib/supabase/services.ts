import { supabase } from './client';

/**
 * SQL Schema for Supabase:
 * 
 * create table tenders (
 *   id text primary key,
 *   company_id text,
 *   name text,
 *   moa text,
 *   deadline text,
 *   status text,
 *   estimated_value numeric,
 *   location text,
 *   description text,
 *   created_at timestamp with time zone default now(),
 *   files jsonb,
 *   synthesis jsonb
 * );
 * 
 * Storage: Create a public bucket named 'dce-files'
 */

export const uploadTenderFile = async (tenderId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${tenderId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `tenders/${fileName}`;

  const { data, error } = await supabase.storage
    .from('dce-files')
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('dce-files')
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicUrl,
    name: file.name,
    size: file.size,
    type: fileExt?.toUpperCase() || 'PDF'
  };
};

export const saveTenderToDb = async (tender: any) => {
  const { data, error } = await supabase
    .from('tenders')
    .upsert(tender)
    .select();

  if (error) throw error;
  return data[0];
};
