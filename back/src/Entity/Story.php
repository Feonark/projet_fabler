<?php

namespace App\Entity;

use App\Enum\Genre;
use App\Enum\Access;
use App\Enum\Audience;
use App\Enum\Language;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use Doctrine\DBAL\Types\Types;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use Doctrine\ORM\Mapping as ORM;
use App\State\StoryStateProvider;
use App\State\StoryStateProcessor;
use App\Repository\StoryRepository;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: StoryRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['read', 'user:item:read']],
    denormalizationContext: ['groups' => ['write']],
    operations: [
        new Get(
            provider: StoryStateProvider::class,
            normalizationContext: ['groups' => ['story:item:read']],
        ),
        new GetCollection(),
        new GetCollection(
            uriTemplate: '/users/{id}/stories',
            uriVariables: [
                'id' => new Link(
                    fromClass: User::class,
                    fromProperty: 'authoredStories'
                )
            ]
        ),
        new Post(
            processor: StoryStateProcessor::class,
            security: "is_granted('ROLE_USER')",
            validationContext: ['groups' => ['create']],
            denormalizationContext: ['groups' => ['create_write']]
        ),
        new Patch(
            processor: StoryStateProcessor::class,
            security: "is_granted('POST_EDIT', object)",
            validationContext: ['groups' => ['edit']],
            denormalizationContext: ['groups' => ['edit_write']]
        ),
        new Delete(
            security: "is_granted('POST_DELETE', object)"
        ),
    ]
)]
class Story
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:item:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 6, nullable: true)]
    private ?string $hashId = null;

    #[ORM\Column(length: 50)]
    #[Assert\NotBlank(
        groups: ['create', 'edit']
    )]
    #[Assert\Length(
        min: 3,
        max: 50,
        minMessage: 'The title must be at least {{ limit }} characters long.',
        maxMessage: 'The title cannot be longer than {{ limit }} characters.',
        groups: ['create', 'edit']
    )]
    #[Assert\Regex(
        pattern: '/<[^>]*>/',
        match: false,
        message: 'HTML tags are not allowed in the title.',
        groups: ['create', 'edit']
    )]
    #[Groups(['user:item:read', 'story:item:read', 'create_write', 'edit_write'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Assert\Length(
        max: 1000,
        maxMessage: 'The description cannot be longer than {{ limit }} characters.',
        groups: ['create', 'edit']
    )]
    #[Assert\Regex(
        pattern: '/<[^>]*>/',
        match: false,
        message: 'HTML tags are not allowed in the description.',
        groups: ['create', 'edit']
    )]
    #[Assert\Regex(
        pattern: '/\S/',
        message: 'The description cannot be empty or contain only spaces.',
        groups: ['create', 'edit']
    )]
    #[Groups(['story:item:read', 'create_write', 'edit_write'])]
    private ?string $description = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['user:item:read', 'story:item:read', 'create_write', 'edit_write'])]
    private ?string $bannerImageUrl = null;

    #[ORM\Column]
    #[Groups(['story:item:read', 'create_write', 'edit_write'])]
    private ?bool $isPublic = null;

    #[ORM\Column(enumType: Genre::class)]
    #[Groups(['story:item:read', 'create_write', 'edit_write'])]
    private ?Genre $genreType = null;

    #[ORM\Column(enumType: Audience::class)]
    #[Groups(['story:item:read', 'create_write', 'edit_write'])]
    private ?Audience $audienceType = null;

    #[ORM\Column(enumType: Access::class)]
    #[Groups(['story:item:read', 'create_write', 'edit_write'])]
    private ?Access $accessType = null;

    #[ORM\Column(enumType: Language::class)]
    #[Groups(['story:item:read', 'create_write', 'edit_write'])]
    private ?Language $languageType = null;

    #[ORM\ManyToOne(inversedBy: 'authoredStories')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['story:item:read'])]
    private ?User $author = null;

    /**
     * @var Collection<int, Character>
     */
    #[ORM\ManyToMany(targetEntity: Character::class, mappedBy: 'usedInStories')]
    private Collection $characters;

    /**
     * @var Collection<int, StoryMember>
     */
    #[ORM\OneToMany(
        targetEntity: StoryMember::class,
        mappedBy: 'story',
        cascade: ['remove'],
        orphanRemoval: true
    )]
    #[Groups(['story:item:read'])]
    private Collection $members;

    #[ORM\OneToOne(mappedBy: 'story', cascade: ['persist', 'remove'])]
    private ?Chat $chat = null;

    /**
     * @var Collection<int, Place>
     */
    #[ORM\OneToMany(targetEntity: Place::class, mappedBy: 'story', orphanRemoval: true)]
    #[Groups(['story:item:read'])]
    private Collection $places;

    public function __construct()
    {
        $this->characters = new ArrayCollection();
        $this->members = new ArrayCollection();
        $this->places = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getHashId(): ?string
    {
        return $this->hashId;
    }

    public function setHashId(string $hashId): static
    {
        $this->hashId = $hashId;

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getBannerImageUrl(): ?string
    {
        return $this->bannerImageUrl;
    }

    public function setBannerImageUrl(?string $bannerImageUrl): static
    {
        $this->bannerImageUrl = $bannerImageUrl;

        return $this;
    }

    public function isPublic(): ?bool
    {
        return $this->isPublic;
    }

    public function setIsPublic(bool $isPublic): static
    {
        $this->isPublic = $isPublic;

        return $this;
    }

    public function getGenreType(): ?Genre
    {
        return $this->genreType;
    }

    public function setGenreType(Genre $genreType): static
    {
        $this->genreType = $genreType;

        return $this;
    }

    public function getAudienceType(): ?Audience
    {
        return $this->audienceType;
    }

    public function setAudienceType(Audience $audienceType): static
    {
        $this->audienceType = $audienceType;

        return $this;
    }

    public function getAccessType(): ?Access
    {
        return $this->accessType;
    }

    public function setAccessType(Access $accessType): static
    {
        $this->accessType = $accessType;

        return $this;
    }

    /**
     * @return Collection<int, Character>
     */
    public function getCharacters(): Collection
    {
        return $this->characters;
    }

    public function addCharacter(Character $character): static
    {
        if (!$this->characters->contains($character)) {
            $this->characters->add($character);
            $character->addUsedInStory($this);
        }

        return $this;
    }

    public function removeCharacter(Character $character): static
    {
        if ($this->characters->removeElement($character)) {
            $character->removeUsedInStory($this);
        }

        return $this;
    }

    public function getAuthor(): ?User
    {
        return $this->author;
    }

    public function setAuthor(?User $author): static
    {
        $this->author = $author;

        return $this;
    }

    /**
     * @return Collection<int, StoryMember>
     */
    public function getMembers(): Collection
    {
        return $this->members;
    }

    public function addMember(StoryMember $member): static
    {
        if (!$this->members->contains($member)) {
            $this->members->add($member);
            $member->setStory($this);
        }

        return $this;
    }

    public function removeMember(StoryMember $member): static
    {
        if ($this->members->removeElement($member)) {
            // set the owning side to null (unless already changed)
            if ($member->getStory() === $this) {
                $member->setStory(null);
            }
        }

        return $this;
    }

    public function getChat(): ?Chat
    {
        return $this->chat;
    }

    public function setChat(Chat $chat): static
    {
        // set the owning side of the relation if necessary
        if ($chat->getStory() !== $this) {
            $chat->setStory($this);
        }

        $this->chat = $chat;

        return $this;
    }

    /**
     * @return Collection<int, Place>
     */
    public function getPlaces(): Collection
    {
        return $this->places;
    }

    public function addPlace(Place $place): static
    {
        if (!$this->places->contains($place)) {
            $this->places->add($place);
            $place->setStory($this);
        }

        return $this;
    }

    public function removePlace(Place $place): static
    {
        if ($this->places->removeElement($place)) {
            // set the owning side to null (unless already changed)
            if ($place->getStory() === $this) {
                $place->setStory(null);
            }
        }

        return $this;
    }

    public function getLanguageType(): ?Language
    {
        return $this->languageType;
    }

    public function setLanguageType(Language $languageType): static
    {
        $this->languageType = $languageType;

        return $this;
    }
}
