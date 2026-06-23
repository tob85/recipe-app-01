using Microsoft.AspNetCore.Mvc;
using RecipeApi.Models;
using RecipeApi.Services;

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
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Receptnamn måste anges");
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
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest("Receptnamn måste anges");
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
}
