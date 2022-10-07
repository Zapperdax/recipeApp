const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
    recipeId: {
        type: mongoose.Schema.Types.ObjectId
    }
})

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;