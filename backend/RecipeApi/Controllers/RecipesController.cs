using Microsoft.AspNetCore.Mvc;
using RecipeApi.Models;
using RecipeApi.Services;

using RecipeApi.Validation;

namespace RecipeApi.Controllers;

[ApiController]
[Route("recipes")]
public class RecipesController(IRecipeService recipeService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<RecipeListItem>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<RecipeListItem>>> GetAll(CancellationToken cancellationToken)
    {
        var recipes = await recipeService.GetAllAsync(cancellationToken);
        return Ok(recipes);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(RecipeDetail), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RecipeDetail>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var recipe = await recipeService.GetByIdAsync(id, cancellationToken);
        if (recipe is null)
        {
            return NotFound();
        }

        return Ok(recipe);
    }

    [HttpPost]
    [ProducesResponseType(typeof(RecipeDetail), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RecipeDetail>> Create(
        [FromBody] CreateRecipeRequest request,
        CancellationToken cancellationToken)
    {
        var validationError = RecipeInputValidator.Validate(
            request.Name,
            request.Url,
            request.Ingredients,
            request.Instructions);

        if (validationError is not null)
        {
            return BadRequest(validationError);
        }

        var recipe = await recipeService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, recipe);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(RecipeDetail), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RecipeDetail>> Update(
        Guid id,
        [FromBody] UpdateRecipeRequest request,
        CancellationToken cancellationToken)
    {
        var validationError = RecipeInputValidator.Validate(
            request.Name,
            request.Url,
            request.Ingredients,
            request.Instructions);

        if (validationError is not null)
        {
            return BadRequest(validationError);
        }

        var recipe = await recipeService.UpdateAsync(id, request, cancellationToken);
        if (recipe is null)
        {
            return NotFound();
        }

        return Ok(recipe);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await recipeService.DeleteAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPost("{id:guid}/categories")]
    [ProducesResponseType(typeof(RecipeDetail), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RecipeDetail>> AddCategories(
        Guid id,
        [FromBody] AddCategoriesRequest request,
        CancellationToken cancellationToken)
    {
        if (request.Names.Count == 0 || request.Names.All(string.IsNullOrWhiteSpace))
        {
            return BadRequest("Ange minst en kategori");
        }

        var recipe = await recipeService.AddCategoriesAsync(id, request.Names, cancellationToken);
        if (recipe is null)
        {
            return NotFound();
        }

        return Ok(recipe);
    }

    [HttpPatch("{id:guid}/notes")]
    [ProducesResponseType(typeof(RecipeDetail), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RecipeDetail>> UpdateNotes(
        Guid id,
        [FromBody] UpdateRecipeNotesRequest request,
        CancellationToken cancellationToken)
    {
        var recipe = await recipeService.UpdateNotesAsync(id, request.Notes, cancellationToken);
        if (recipe is null)
        {
            return NotFound();
        }

        return Ok(recipe);
    }
}
