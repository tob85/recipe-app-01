using Microsoft.EntityFrameworkCore;
using RecipeApi.Entities;

namespace RecipeApi.Data;

public class RecipeDbContext(DbContextOptions<RecipeDbContext> options) : DbContext(options)
{
    public DbSet<Recipe> Recipes => Set<Recipe>();

    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(recipe => recipe.Id);
            entity.Property(recipe => recipe.Name).IsRequired().HasMaxLength(200);
            entity.Property(recipe => recipe.Url).HasMaxLength(2048);
            entity.Property(recipe => recipe.Ingredients).HasMaxLength(4000);
            entity.Property(recipe => recipe.Instructions).HasMaxLength(8000);
            entity.Property(recipe => recipe.Notes).HasMaxLength(1000);

            entity.HasMany(recipe => recipe.Categories)
                .WithMany(category => category.Recipes);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(category => category.Id);
            entity.Property(category => category.Name).IsRequired().HasMaxLength(100);
            entity.HasIndex(category => category.Name).IsUnique();
        });
    }
}
