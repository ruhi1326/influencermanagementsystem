// backend/controllers/brandController.js
const supabase = require('../config/supabaseClient');
// Helper for validation
const validateEmail = (email) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
const validatePhone = (phone) => /^\d{10}$/.test(phone);

// Get all brands
async function getBrands(req, res) {
    const { data, error } = await supabase.from('brands').select('*').eq('deleted', false).order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
}

// Add brand
async function addBrand(req, res) {
    const { name, category, contact_person, contact_email, contact_phone, description, status } = req.body;

    // Validation
    if (!name) return res.status(400).json({ error: 'Brand name is required' });
    if (contact_email && !validateEmail(contact_email)) return res.status(400).json({ error: 'Invalid email format' });
    if (contact_phone && !validatePhone(contact_phone)) return res.status(400).json({ error: 'Invalid phone number' });

    const { data, error } = await supabase
        .from('brands')
        .insert([{ name, category, contact_person, contact_email, contact_phone, description, status }])
        .select('*')
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Brand added successfully', brand: data });
}

// Update brand (only editable fields)
async function updateBrand(req, res) {
    const { id } = req.params;
    const { contact_person, contact_email, contact_phone, status } = req.body;

    // Validation
    if (contact_email && !validateEmail(contact_email)) 
        return res.status(400).json({ error: 'Invalid email format' });
    if (contact_phone && !validatePhone(contact_phone)) 
        return res.status(400).json({ error: 'Invalid phone number' });

    const { data, error } = await supabase
        .from('brands')
        .update({ 
            contact_person, 
            contact_email, 
            contact_phone, 
            status, 
            updated_at: new Date() 
        })
        .eq('brand_id', id)
        .select('*')       // ✅ Return the updated row
        .single();         // ✅ Get a single object instead of array

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Brand updated successfully', brand: data });
}

// Delete brand
async function deleteBrand(req, res) {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('brands')
        .update({ deleted: true, status: 'inactive', updated_at: new Date() })
        .eq('brand_id', id)
        .select('*')
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: 'Brand deleted (soft) successfully', brand: data });
}


module.exports = { getBrands, addBrand, updateBrand, deleteBrand };

