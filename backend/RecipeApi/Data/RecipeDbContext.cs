using Microsoft.EntityFrameworkCore;
using RecipeApi.Entities;

namespace RecipeApi.Data;

public class RecipeDbContext(DbContextOptions<RecipeDbContext> options) : DbContext(options)
{
    public DbSet<Recipe> Recipes => Set<Recipe>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(recipe => recipe.Id);
            entity.Property(recipe => recipe.Name).IsRequired().HasMaxLength(200);
            entity.Property(recipe => recipe.Url).HasMaxLength(2048);
            entity.Property(recipe => recipe.Ingredients).HasMaxLength(4000);
            entity.Property(recipe => recipe.Instructions).HasMaxLength(8000);
        });
    }
}
